package com.edusphere.service;

import com.edusphere.dto.ml.MlFastApiPredictionRequest;
import com.edusphere.dto.ml.MlFastApiPredictionResponse;
import com.edusphere.dto.ml.StudentPredictionResponseDto;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class MlPredictionService {

    private static final Logger log = LoggerFactory.getLogger(MlPredictionService.class);

    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final SemesterResultRepository semesterResultRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final AuditLogService auditLogService;
    private final RestClient restClient;

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    public MlPredictionService(StudentProfileRepository studentProfileRepository,
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

    @Transactional
    public StudentPredictionResponseDto predictMySemesterPerformance(Long userId, HttpServletRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return performSemesterPrediction(student, student.getUser(), request);
    }

    @Transactional
    public StudentPredictionResponseDto predictStudentSemesterPerformance(Long studentProfileId,
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
                throw new UnauthorizedAccessException("You are not authorized to run predictions for students outside your department.");
            }
        } else if (requestingRole == Role.STAFF) {
            StaffProfile staff = staffProfileRepository.findByUserId(requestingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", requestingUserId));
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            boolean authorized = assignments.stream()
                    .anyMatch(ta -> Objects.equals(ta.getSection().getId(), student.getSection().getId()));
            if (!authorized) {
                throw new UnauthorizedAccessException("You are not authorized to run predictions for students outside your assigned classes.");
            }
        } else if (requestingRole == Role.STUDENT) {
            if (!Objects.equals(student.getUser().getId(), requestingUserId)) {
                throw new UnauthorizedAccessException("Students can only request prediction for their own profile.");
            }
        } else {
            throw new UnauthorizedAccessException("Unauthorized role for ML prediction.");
        }

        return performSemesterPrediction(student, student.getUser(), request);
    }

    private StudentPredictionResponseDto performSemesterPrediction(StudentProfile student, User requestingUser, HttpServletRequest request) {
        int currYear = deriveCurrentYear(student.getEnrollmentYear());
        int currSem = deriveCurrentSemester(currYear);
        String academicYear = getCurrentAcademicYear();

        // 1. Fetch subjects for student's department and current active semester
        List<Subject> enrolledSubjects = subjectRepository.findByDepartmentIdAndSemester(student.getDepartment().getId(), currSem);
        if (enrolledSubjects.isEmpty()) {
            return StudentPredictionResponseDto.unavailable(currSem, academicYear,
                    "No subjects are registered for Semester " + currSem + " in your department curriculum.");
        }

        // 2. Fetch subject academic records for this student and current semester
        List<SubjectAcademicRecord> records = subjectAcademicRecordRepository.findByStudentIdAndSemester(student.getId(), currSem);

        double iat1Sum = 0.0, iat2Sum = 0.0, assignSum = 0.0, attSum = 0.0;
        int iat1Count = 0, iat2Count = 0, assignCount = 0, attCount = 0;

        for (Subject sub : enrolledSubjects) {
            Optional<SubjectAcademicRecord> rOpt = records.stream()
                    .filter(r -> Objects.equals(r.getSubject().getId(), sub.getId()))
                    .findFirst();

            if (rOpt.isEmpty()) {
                return StudentPredictionResponseDto.unavailable(currSem, academicYear,
                        "Prediction requires posted continuous assessment records for all enrolled subjects (" + sub.getName() + " is pending).");
            }

            SubjectAcademicRecord r = rOpt.get();
            if (r.getIat1Score() == null || r.getIat2Score() == null || r.getAssignmentScore() == null || r.getAttendancePercentage() == null) {
                return StudentPredictionResponseDto.unavailable(currSem, academicYear,
                        "Prediction requires completed IAT 1, IAT 2, assignment, and attendance marks for " + sub.getName() + ".");
            }

            iat1Sum += r.getIat1Score().doubleValue();
            iat1Count++;
            iat2Sum += r.getIat2Score().doubleValue();
            iat2Count++;
            assignSum += r.getAssignmentScore().doubleValue();
            assignCount++;
            attSum += r.getAttendancePercentage().doubleValue();
            attCount++;
        }

        if (iat1Count == 0 || iat2Count == 0 || assignCount == 0 || attCount == 0) {
            return StudentPredictionResponseDto.unavailable(currSem, academicYear,
                    "Prediction requires complete continuous assessment records across all enrolled subjects.");
        }

        double avgIat1 = Math.round((iat1Sum / iat1Count) * 100.0) / 100.0;
        double avgIat2 = Math.round((iat2Sum / iat2Count) * 100.0) / 100.0;
        double avgAssign = Math.round((assignSum / assignCount) * 100.0) / 100.0;
        double avgAtt = Math.round((attSum / attCount) * 100.0) / 100.0;

        Double prevScore = null;
        if (currSem > 1) {
            // Find previous semester result with actual score
            List<SemesterResult> previousResults = semesterResultRepository.findByStudentIdOrderBySemesterAsc(student.getId());
            Optional<SemesterResult> directPrev = previousResults.stream()
                    .filter(sr -> Objects.equals(sr.getSemester(), currSem - 1) && sr.getActualSemesterScore() != null)
                    .findFirst();

            if (directPrev.isPresent()) {
                prevScore = directPrev.get().getActualSemesterScore().doubleValue();
            } else {
                // Fallback to most recent completed semester actual score
                Optional<SemesterResult> latestCompleted = previousResults.stream()
                        .filter(sr -> sr.getSemester() < currSem && sr.getActualSemesterScore() != null)
                        .max(Comparator.comparingInt(SemesterResult::getSemester));

                if (latestCompleted.isPresent()) {
                    prevScore = latestCompleted.get().getActualSemesterScore().doubleValue();
                } else {
                    return StudentPredictionResponseDto.unavailable(currSem, academicYear,
                            "Prediction for Semester " + currSem + " requires a finalized actual semester score from previous semester.");
                }
            }
        }

        // 3. Construct FastAPI ML Payload
        MlFastApiPredictionRequest fastApiRequest = new MlFastApiPredictionRequest(
                currSem, avgIat1, avgIat2, avgAssign, avgAtt, prevScore
        );

        MlFastApiPredictionResponse fastApiResponse;
        try {
            String url = mlServiceUrl.replaceAll("/+$", "") + "/predict";
            log.info("Calling ML Prediction microservice at {} for student [{}] Sem [{}]", url, student.getRegisterNumber(), currSem);

            fastApiResponse = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(fastApiRequest)
                    .retrieve()
                    .body(MlFastApiPredictionResponse.class);

        } catch (RestClientException e) {
            log.error("Failed to connect to ML Prediction Service: {}", e.getMessage());
            throw new BadRequestException("ML Prediction service is currently unavailable. Please ensure the Python FastAPI microservice is running at " + mlServiceUrl);
        }

        if (fastApiResponse == null || fastApiResponse.getPredictedSemesterScore() == null) {
            throw new BadRequestException("ML prediction service returned an empty result.");
        }

        double rawScore = fastApiResponse.getPredictedSemesterScore();
        double clampedScore = Math.max(0.0, Math.min(100.0, Math.round(rawScore * 100.0) / 100.0));

        // 4. Persist predictedSemesterScore into MySQL SemesterResult without overwriting actualSemesterScore
        SemesterResult semesterResult = semesterResultRepository
                .findByStudentIdAndSemesterAndAcademicYear(student.getId(), currSem, academicYear)
                .orElseGet(() -> {
                    SemesterResult sr = new SemesterResult();
                    sr.setStudent(student);
                    sr.setSemester(currSem);
                    sr.setAcademicYear(academicYear);
                    return sr;
                });

        semesterResult.setPredictedSemesterScore(BigDecimal.valueOf(clampedScore).setScale(2, RoundingMode.HALF_UP));
        semesterResultRepository.save(semesterResult);

        // 5. Audit Logging
        String ip = request != null ? request.getRemoteAddr() : "127.0.0.1";
        auditLogService.logAction(
                requestingUser,
                requestingUser != null ? requestingUser.getEmail() : student.getUser().getEmail(),
                "GENERATE_ML_PREDICTION",
                "SemesterResult",
                String.valueOf(semesterResult.getId()),
                "Predicted Semester " + currSem + " Score: " + clampedScore + " for " + student.getRegisterNumber(),
                ip
        );

        // 6. Build response DTO
        StudentPredictionResponseDto responseDto = new StudentPredictionResponseDto();
        responseDto.setAvailable(true);
        responseDto.setPredictedSemesterScore(clampedScore);
        responseDto.setSemester(currSem);
        responseDto.setAcademicYear(academicYear);
        responseDto.setCurrentIat1Average(avgIat1);
        responseDto.setCurrentIat2Average(avgIat2);
        responseDto.setCurrentAssignmentAverage(avgAssign);
        responseDto.setCurrentAttendanceAverage(avgAtt);
        responseDto.setPreviousSemesterScore(prevScore);
        responseDto.setMessage("Semester performance predicted successfully based on continuous assessment records.");

        return responseDto;
    }
}
