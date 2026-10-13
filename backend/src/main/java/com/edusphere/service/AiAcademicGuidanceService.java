package com.edusphere.service;

import com.edusphere.dto.ai.AcademicGuidanceResponse;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.*;

@Service
public class AiAcademicGuidanceService {

    private static final Logger log = LoggerFactory.getLogger(AiAcademicGuidanceService.class);

    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final SemesterResultRepository semesterResultRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final AuditLogService auditLogService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    public AiAcademicGuidanceService(StudentProfileRepository studentProfileRepository,
                                     SubjectRepository subjectRepository,
                                     TeachingAssignmentRepository teachingAssignmentRepository,
                                     SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                                     SemesterResultRepository semesterResultRepository,
                                     StaffProfileRepository staffProfileRepository,
                                     HodProfileRepository hodProfileRepository,
                                     AuditLogService auditLogService) {
        this.studentProfileRepository = studentProfileRepository;
        this.subjectRepository = subjectRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.semesterResultRepository = semesterResultRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.auditLogService = auditLogService;
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    private int deriveCurrentYear(int enrollmentYear) {
        LocalDate now = LocalDate.now();
        int yearDiff = now.getYear() - enrollmentYear;
        if (now.getMonthValue() >= 6) {
            yearDiff += 1;
        }
        return Math.max(1, Math.min(4, yearDiff));
    }

    private int deriveCurrentSemester(int currentYear) {
        LocalDate now = LocalDate.now();
        boolean isOddSemester = now.getMonthValue() >= 6 && now.getMonthValue() <= 11;
        return (currentYear - 1) * 2 + (isOddSemester ? 1 : 2);
    }

    private String getCurrentAcademicYear() {
        LocalDate now = LocalDate.now();
        int startYear = now.getMonthValue() >= 6 ? now.getYear() : now.getYear() - 1;
        return startYear + "-" + (startYear + 1);
    }

    @Transactional(readOnly = true)
    public AcademicGuidanceResponse getMyAcademicGuidance(Long userId, HttpServletRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return generateAcademicGuidance(student, student.getUser(), request);
    }

    @Transactional(readOnly = true)
    public AcademicGuidanceResponse getStudentAcademicGuidance(Long studentProfileId,
                                                               Long requestingUserId,
                                                               Role requestingRole,
                                                               HttpServletRequest request) {
        StudentProfile student = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        // Strict Backend Authorization
        if (requestingRole == Role.ADMIN) {
            // Admin authorized for all
        } else if (requestingRole == Role.HOD) {
            HodProfile hod = hodProfileRepository.findByUserId(requestingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", requestingUserId));
            if (!Objects.equals(student.getDepartment().getId(), hod.getDepartment().getId())) {
                throw new UnauthorizedAccessException("You are not authorized to view guidance for students outside your department.");
            }
        } else if (requestingRole == Role.STAFF) {
            StaffProfile staff = staffProfileRepository.findByUserId(requestingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", requestingUserId));
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            boolean authorized = assignments.stream()
                    .anyMatch(ta -> Objects.equals(ta.getSection().getId(), student.getSection().getId()));
            if (!authorized) {
                throw new UnauthorizedAccessException("You are not authorized to view guidance for students outside your assigned classes.");
            }
        } else if (requestingRole == Role.STUDENT) {
            if (!Objects.equals(student.getUser().getId(), requestingUserId)) {
                throw new UnauthorizedAccessException("Students can only view their own academic guidance.");
            }
        } else {
            throw new UnauthorizedAccessException("Unauthorized role for academic guidance.");
        }

        return generateAcademicGuidance(student, student.getUser(), request);
    }

    private AcademicGuidanceResponse generateAcademicGuidance(StudentProfile student, User requestingUser, HttpServletRequest request) {
        int currYear = deriveCurrentYear(student.getEnrollmentYear());
        int currSem = deriveCurrentSemester(currYear);
        String academicYear = getCurrentAcademicYear();

        // 1. Fetch enrolled subjects and records for current active semester
        List<Subject> enrolledSubjects = subjectRepository.findByDepartmentIdAndSemester(student.getDepartment().getId(), currSem);
        List<SubjectAcademicRecord> records = subjectAcademicRecordRepository.findByStudentIdAndSemester(student.getId(), currSem);

        if (enrolledSubjects.isEmpty()) {
            return AcademicGuidanceResponse.unavailable("No enrolled courses found for Semester " + currSem + " in department catalog.");
        }

        // 2. Fetch current and previous semester results from MySQL
        List<SemesterResult> semesterResults = semesterResultRepository.findByStudentIdOrderBySemesterAsc(student.getId());

        Optional<SemesterResult> currentSemResult = semesterResults.stream()
                .filter(sr -> Objects.equals(sr.getSemester(), currSem))
                .findFirst();

        Optional<SemesterResult> prevSemResult = semesterResults.stream()
                .filter(sr -> Objects.equals(sr.getSemester(), currSem - 1) && sr.getActualSemesterScore() != null)
                .findFirst();

        // 3. Compile grounded context summary
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("STUDENT ACADEMIC CONTEXT (GROUNDED IN MYSQL DATABASE):\n");
        contextBuilder.append(String.format("Student: %s (%s)\n", student.getFullName(), student.getRegisterNumber()));
        contextBuilder.append(String.format("Department: %s | Section: %s | Year: %d | Active Semester: %d (%s)\n\n",
                student.getDepartment().getName(), student.getSection().getName(), currYear, currSem, academicYear));

        contextBuilder.append("CURRENT SEMESTER SUBJECT CONTINUOUS ASSESSMENT:\n");
        int hasRecordCount = 0;
        double totalAtt = 0.0;
        int attCount = 0;

        for (Subject sub : enrolledSubjects) {
            Optional<SubjectAcademicRecord> rOpt = records.stream()
                    .filter(r -> Objects.equals(r.getSubject().getId(), sub.getId()))
                    .findFirst();

            contextBuilder.append(String.format("- Subject: %s (%s, %d Credits)\n", sub.getName(), sub.getCode(), sub.getCredits()));
            if (rOpt.isPresent()) {
                hasRecordCount++;
                SubjectAcademicRecord r = rOpt.get();
                String iat1 = r.getIat1Score() != null ? r.getIat1Score() + "/50" : "Pending";
                String iat2 = r.getIat2Score() != null ? r.getIat2Score() + "/50" : "Pending";
                String assign = r.getAssignmentScore() != null ? r.getAssignmentScore() + "/25" : "Pending";
                String att = r.getAttendancePercentage() != null ? r.getAttendancePercentage() + "%" : "Pending";
                if (r.getAttendancePercentage() != null) {
                    totalAtt += r.getAttendancePercentage().doubleValue();
                    attCount++;
                }
                contextBuilder.append(String.format("  * IAT 1: %s | IAT 2: %s | Assignment: %s | Attendance: %s\n", iat1, iat2, assign, att));
            } else {
                contextBuilder.append("  * Assessment marks pending entry by faculty.\n");
            }
        }

        if (hasRecordCount == 0) {
            return AcademicGuidanceResponse.unavailable(
                    "Academic guidance requires at least some posted continuous assessment or attendance records for Semester " + currSem + ".");
        }

        // Add ML prediction and previous results context
        contextBuilder.append("\nSEMESTER RESULT & ML PREDICTION CONTEXT:\n");
        if (currentSemResult.isPresent()) {
            SemesterResult sr = currentSemResult.get();
            if (sr.getPredictedSemesterScore() != null) {
                contextBuilder.append(String.format("- Phase 13 ML Predicted Semester Score: %.1f/100 (Generated via Random Forest Regressor)\n",
                        sr.getPredictedSemesterScore().doubleValue()));
            }
            if (sr.getActualSemesterScore() != null) {
                contextBuilder.append(String.format("- Official Semester Final Score: %.1f/100\n",
                        sr.getActualSemesterScore().doubleValue()));
            }
        }
        if (prevSemResult.isPresent()) {
            contextBuilder.append(String.format("- Previous Semester (Sem %d) Final Actual Score: %.1f/100\n",
                    prevSemResult.get().getSemester(), prevSemResult.get().getActualSemesterScore().doubleValue()));
        }

        String academicContextSummary = String.format("Semester %d • Avg Attendance: %s • ML Prediction: %s",
                currSem,
                attCount > 0 ? String.format("%.1f%%", totalAtt / attCount) : "N/A",
                currentSemResult.isPresent() && currentSemResult.get().getPredictedSemesterScore() != null
                        ? String.format("%.1f/100", currentSemResult.get().getPredictedSemesterScore().doubleValue())
                        : "Not generated");

        // 4. Verify Gemini API Key configuration
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equalsIgnoreCase("demo-key")) {
            log.warn("Gemini API key is not set. Providing grounded deterministic guidance template.");
            return buildDeterministicGuidance(student, currSem, records, currentSemResult.orElse(null), academicContextSummary);
        }

        // 5. Construct System Prompt & Call Gemini API
        String systemInstruction = """
                You are an academic guidance assistant for EduSphere - Unified CampusHub.
                Use ONLY the verified academic information provided in this prompt.
                
                CRITICAL GUARDRAILS:
                - Do NOT calculate official grades or fabricate missing data.
                - Do NOT replace or recalculate the ML predicted semester score.
                - Do NOT provide placement predictions, placement readiness, or company hiring recommendations.
                - Do NOT provide risk scores, risk levels, failure probabilities, or student rankings.
                - Do NOT claim that this guidance is an official university grade assessment.
                - Provide qualitative, constructive, student-friendly academic study strategies and recommendations.
                
                You must respond in valid JSON format matching this exact schema:
                {
                  "summary": "2-3 sentences summarizing overall current academic progress, attendance health, and focus.",
                  "strengths": [
                    "Highlight specific strong subjects, good attendance areas, or high assignment scores"
                  ],
                  "areasToFocus": [
                    "Highlight specific subjects with lower IAT scores or attendance below 75%"
                  ],
                  "studySuggestions": [
                    "3-4 practical, actionable study habits, revision plans, and preparation suggestions"
                  ]
                }
                """;

        String prompt = systemInstruction + "\n\n" + contextBuilder.toString();

        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    geminiModel, geminiApiKey);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", prompt))
                            )
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 1000,
                            "responseMimeType", "application/json"
                    )
            );

            String rawResponse = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            AcademicGuidanceResponse parsedResponse = parseGeminiResponse(rawResponse, academicContextSummary);

            // Audit log
            String ip = request != null ? request.getRemoteAddr() : "127.0.0.1";
            auditLogService.logAction(
                    requestingUser,
                    requestingUser != null ? requestingUser.getEmail() : student.getUser().getEmail(),
                    "GENERATE_GEMINI_GUIDANCE",
                    "StudentProfile",
                    String.valueOf(student.getId()),
                    "Generated Gemini academic guidance for Semester " + currSem + " (" + student.getRegisterNumber() + ")",
                    ip
            );

            return parsedResponse;

        } catch (RestClientException e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            // Graceful fallback to grounded guidance template
            return buildDeterministicGuidance(student, currSem, records, currentSemResult.orElse(null), academicContextSummary);
        } catch (Exception e) {
            log.error("Error processing Gemini guidance: {}", e.getMessage());
            return buildDeterministicGuidance(student, currSem, records, currentSemResult.orElse(null), academicContextSummary);
        }
    }

    private AcademicGuidanceResponse parseGeminiResponse(String rawJson, String academicContextSummary) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String contentText = parts.get(0).path("text").asText();

                    // Clean markdown code fence if wrapped
                    if (contentText.startsWith("```json")) {
                        contentText = contentText.substring(7);
                    } else if (contentText.startsWith("```")) {
                        contentText = contentText.substring(3);
                    }
                    if (contentText.endsWith("```")) {
                        contentText = contentText.substring(0, contentText.length() - 3);
                    }
                    contentText = contentText.trim();

                    JsonNode guidanceJson = objectMapper.readTree(contentText);

                    AcademicGuidanceResponse res = new AcademicGuidanceResponse();
                    res.setAvailable(true);
                    res.setSummary(guidanceJson.path("summary").asText("Grounded academic analysis completed successfully."));
                    res.setAcademicContextSummary(academicContextSummary);
                    res.setMessage("AI Academic Guidance generated successfully based on verified continuous assessment records.");

                    JsonNode strengthsNode = guidanceJson.path("strengths");
                    if (strengthsNode.isArray()) {
                        for (JsonNode s : strengthsNode) {
                            res.getStrengths().add(s.asText());
                        }
                    }

                    JsonNode focusNode = guidanceJson.path("areasToFocus");
                    if (focusNode.isArray()) {
                        for (JsonNode f : focusNode) {
                            res.getAreasToFocus().add(f.asText());
                        }
                    }

                    JsonNode suggestionsNode = guidanceJson.path("studySuggestions");
                    if (suggestionsNode.isArray()) {
                        for (JsonNode sug : suggestionsNode) {
                            res.getStudySuggestions().add(sug.asText());
                        }
                    }

                    return res;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Gemini structured JSON: {}", e.getMessage());
        }

        AcademicGuidanceResponse fallback = new AcademicGuidanceResponse();
        fallback.setAvailable(true);
        fallback.setSummary("Academic assessment records evaluated. Consistent revision and active classroom attendance are recommended.");
        fallback.setAcademicContextSummary(academicContextSummary);
        fallback.setMessage("Academic guidance generated successfully.");
        return fallback;
    }

    private AcademicGuidanceResponse buildDeterministicGuidance(StudentProfile student,
                                                                int currSem,
                                                                List<SubjectAcademicRecord> records,
                                                                SemesterResult semResult,
                                                                String academicContextSummary) {
        AcademicGuidanceResponse res = new AcademicGuidanceResponse();
        res.setAvailable(true);
        res.setAcademicContextSummary(academicContextSummary);
        res.setMessage("Academic guidance compiled from verified continuous assessment records.");

        List<String> strengths = new ArrayList<>();
        List<String> areasToFocus = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        for (SubjectAcademicRecord r : records) {
            String subName = r.getSubject() != null ? r.getSubject().getName() : "Subject";
            if (r.getAttendancePercentage() != null && r.getAttendancePercentage().doubleValue() >= 85.0) {
                strengths.add("Strong attendance record in " + subName + " (" + r.getAttendancePercentage() + "%), demonstrating consistent classroom engagement.");
            } else if (r.getAttendancePercentage() != null && r.getAttendancePercentage().doubleValue() < 75.0) {
                areasToFocus.add("Attendance in " + subName + " is currently " + r.getAttendancePercentage() + "% (below 75% threshold). Prioritize upcoming sessions.");
            }

            if (r.getIat1Score() != null && r.getIat1Score().doubleValue() >= 35.0) {
                strengths.add("Solid performance in " + subName + " IAT 1 (" + r.getIat1Score() + "/50).");
            } else if (r.getIat1Score() != null && r.getIat1Score().doubleValue() < 25.0) {
                areasToFocus.add("Continuous assessment score in " + subName + " (" + r.getIat1Score() + "/50) requires targeted revision before semester finals.");
            }
        }

        if (strengths.isEmpty()) {
            strengths.add("All continuous assessment records are actively recorded and tracked in MySQL.");
        }
        if (areasToFocus.isEmpty()) {
            areasToFocus.add("Maintain consistent study momentum across all enrolled subjects as final assessments approach.");
        }

        suggestions.add("Review lecture notes within 24 hours of each class to reinforce conceptual retention.");
        suggestions.add("Practice previous university question papers for subjects with analytical components.");
        suggestions.add("Engage with assigned course faculty during designated tutorial hours for clarification on complex topics.");
        suggestions.add("Maintain attendance above 85% across all courses to remain fully eligible for semester end examinations.");

        if (semResult != null && semResult.getPredictedSemesterScore() != null) {
            res.setSummary("Based on your continuous assessment marks, your ML predicted semester score is " +
                    semResult.getPredictedSemesterScore() + " / 100. Targeted revision in lower-scoring subjects will help maximize your final semester grade.");
        } else {
            res.setSummary("Your continuous assessment records for Semester " + currSem +
                    " indicate steady progress. Use the actionable suggestions below to optimize your preparation.");
        }

        res.setStrengths(strengths);
        res.setAreasToFocus(areasToFocus);
        res.setStudySuggestions(suggestions);

        return res;
    }
}
