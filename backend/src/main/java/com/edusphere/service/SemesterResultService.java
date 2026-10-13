package com.edusphere.service;

import com.edusphere.dto.result.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SemesterResultService {

    private static final Logger log = LoggerFactory.getLogger(SemesterResultService.class);

    private final SemesterResultRepository semesterResultRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final DepartmentRepository departmentRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public SemesterResultService(SemesterResultRepository semesterResultRepository,
                                 SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                                 StudentProfileRepository studentProfileRepository,
                                 SubjectRepository subjectRepository,
                                 SectionRepository sectionRepository,
                                 DepartmentRepository departmentRepository,
                                 TeachingAssignmentRepository teachingAssignmentRepository,
                                 UserRepository userRepository,
                                 AuditLogService auditLogService) {
        this.semesterResultRepository = semesterResultRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.departmentRepository = departmentRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. VERIFY ACADEMIC DATA COMPLETION
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SemesterAcademicVerificationDto verifyAcademicData(Long departmentId, Long sectionId, Integer semester, String academicYear) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));

        List<StudentProfile> students = studentProfileRepository.findByDepartmentIdAndSectionId(departmentId, sectionId);
        List<Subject> subjects = subjectRepository.findByDepartmentIdAndSemester(departmentId, semester);

        SemesterAcademicVerificationDto dto = new SemesterAcademicVerificationDto();
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setSectionId(section.getId());
        dto.setSectionName(section.getName());
        dto.setSemester(semester);
        dto.setAcademicYear(academicYear);
        dto.setTotalStudents(students.size());
        dto.setTotalSubjects(subjects.size());

        int expected = students.size() * subjects.size();
        dto.setExpectedRecords(expected);

        if (students.isEmpty() || subjects.isEmpty()) {
            dto.setCompletedRecords(0);
            dto.setMissingRecords(expected);
            dto.setReadyForGeneration(false);
            dto.setStatusMessage(students.isEmpty() ? "No students enrolled in this section." : "No subjects found in curriculum for Semester " + semester + ".");
            return dto;
        }

        List<SubjectDataSummaryDto> subjectSummaries = new ArrayList<>();
        List<MissingDataDetailDto> missingDetails = new ArrayList<>();
        int completedCount = 0;

        for (Subject sub : subjects) {
            SubjectDataSummaryDto sDto = new SubjectDataSummaryDto();
            sDto.setSubjectId(sub.getId());
            sDto.setSubjectCode(sub.getCode());
            sDto.setSubjectName(sub.getName());
            sDto.setCredits(sub.getCredits());
            sDto.setTotalStudentsCount(students.size());

            // Faculty info
            List<TeachingAssignment> taList = teachingAssignmentRepository.findBySubjectId(sub.getId());
            Optional<TeachingAssignment> sectionTa = taList.stream()
                    .filter(ta -> Objects.equals(ta.getSection().getId(), sectionId))
                    .findFirst();
            sDto.setFacultyName(sectionTa.map(ta -> ta.getStaff().getFullName()).orElse("Unassigned"));

            int subjectCompleteStudents = 0;

            for (StudentProfile student : students) {
                Optional<SubjectAcademicRecord> recordOpt = subjectAcademicRecordRepository
                        .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(student.getId(), sub.getId(), semester, academicYear);

                List<String> missingFields = new ArrayList<>();
                if (recordOpt.isEmpty()) {
                    missingFields.add("All continuous assessment records missing");
                } else {
                    SubjectAcademicRecord rec = recordOpt.get();
                    if (rec.getAttendancePercentage() == null) missingFields.add("Attendance %");
                    if (rec.getIat1Score() == null) missingFields.add("IAT 1 Marks");
                    if (rec.getIat2Score() == null) missingFields.add("IAT 2 Marks");
                    if (rec.getAssignmentScore() == null) missingFields.add("Assignment Marks");
                }

                if (missingFields.isEmpty()) {
                    subjectCompleteStudents++;
                    completedCount++;
                } else {
                    missingDetails.add(new MissingDataDetailDto(
                            student.getId(),
                            student.getRegisterNumber(),
                            student.getFullName(),
                            sub.getCode(),
                            sub.getName(),
                            missingFields
                    ));
                }
            }

            sDto.setRecordedStudentsCount(subjectCompleteStudents);
            sDto.setComplete(subjectCompleteStudents == students.size());
            subjectSummaries.add(sDto);
        }

        dto.setCompletedRecords(completedCount);
        int missing = expected - completedCount;
        dto.setMissingRecords(missing);
        dto.setSubjectSummaries(subjectSummaries);
        dto.setMissingRecordDetails(missingDetails);

        boolean isReady = (missing == 0 && expected > 0);
        dto.setReadyForGeneration(isReady);
        dto.setStatusMessage(isReady
                ? "Academic data fully verified. Ready for semester result generation."
                : "Continuous assessment data incomplete (" + missing + " missing component records). Complete entries before result generation.");

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. GET SECTION RESULTS
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SemesterResultSummaryDto> getSectionResults(Long sectionId, Integer semester, String academicYear) {
        List<SemesterResult> results = semesterResultRepository
                .findByStudentSectionIdAndSemesterAndAcademicYear(sectionId, semester, academicYear);
        return results.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. GENERATE SEMESTER RESULTS
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<SemesterResultSummaryDto> generateSemesterResults(Long adminUserId, GenerateSemesterResultsRequest request, String clientIp) {
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        // 1. Strict verification
        SemesterAcademicVerificationDto verification = verifyAcademicData(
                request.getDepartmentId(), request.getSectionId(), request.getSemester(), request.getAcademicYear());

        if (!verification.isReadyForGeneration()) {
            throw new BadRequestException("Cannot generate semester results: Academic continuous assessment records are incomplete ("
                    + verification.getMissingRecords() + " missing records across students/subjects).");
        }

        List<StudentProfile> students = studentProfileRepository.findByDepartmentIdAndSectionId(request.getDepartmentId(), request.getSectionId());
        List<Subject> subjects = subjectRepository.findByDepartmentIdAndSemester(request.getDepartmentId(), request.getSemester());

        List<SemesterResult> generatedResults = new ArrayList<>();

        for (StudentProfile student : students) {
            double weightedScoreSum = 0.0;
            int totalCredits = 0;
            int creditsEarned = 0;

            for (Subject sub : subjects) {
                int credits = sub.getCredits() != null ? sub.getCredits() : 3;
                totalCredits += credits;

                SubjectAcademicRecord rec = subjectAcademicRecordRepository
                        .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(student.getId(), sub.getId(), request.getSemester(), request.getAcademicYear())
                        .orElseThrow(() -> new BadRequestException("Missing record for student " + student.getRegisterNumber() + " in " + sub.getCode()));

                // Standard EduSphere assessment formula (0-100 scale):
                // IAT 1 (max 50) -> 35%, IAT 2 (max 50) -> 35%, Assignment (max 25) -> 20%, Attendance (max 100) -> 10%
                double iat1Val = rec.getIat1Score() != null ? rec.getIat1Score().doubleValue() : 0.0;
                double iat2Val = rec.getIat2Score() != null ? rec.getIat2Score().doubleValue() : 0.0;
                double assignVal = rec.getAssignmentScore() != null ? rec.getAssignmentScore().doubleValue() : 0.0;
                double attVal = rec.getAttendancePercentage() != null ? rec.getAttendancePercentage().doubleValue() : 0.0;

                double subjectScore = (iat1Val / 50.0) * 35.0
                        + (iat2Val / 50.0) * 35.0
                        + (assignVal / 25.0) * 20.0
                        + (attVal / 100.0) * 10.0;
                subjectScore = Math.max(0.0, Math.min(100.0, subjectScore));
                subjectScore = Math.round(subjectScore * 100.0) / 100.0;

                String subGrade = deriveGrade(subjectScore);
                String subResult = subjectScore >= 50.0 ? "PASS" : "RA";

                rec.setFinalScore(BigDecimal.valueOf(subjectScore).setScale(2, RoundingMode.HALF_UP));
                rec.setGrade(subGrade);
                rec.setResult(subResult);
                subjectAcademicRecordRepository.save(rec);

                weightedScoreSum += (subjectScore * credits);
                if (subjectScore >= 50.0) {
                    creditsEarned += credits;
                }
            }

            double semesterScore = totalCredits > 0 ? (weightedScoreSum / totalCredits) : 0.0;
            semesterScore = Math.round(semesterScore * 100.0) / 100.0;

            String grade = deriveGrade(semesterScore);

            // Persist into SemesterResult
            SemesterResult result = semesterResultRepository
                    .findByStudentIdAndSemesterAndAcademicYear(student.getId(), request.getSemester(), request.getAcademicYear())
                    .orElseGet(() -> {
                        SemesterResult sr = new SemesterResult();
                        sr.setStudent(student);
                        sr.setSemester(request.getSemester());
                        sr.setAcademicYear(request.getAcademicYear());
                        return sr;
                    });

            result.setActualSemesterScore(BigDecimal.valueOf(semesterScore).setScale(2, RoundingMode.HALF_UP));
            result.setStatus(ResultStatus.DRAFT);
            result.setGrade(grade);
            result.setTotalCredits(totalCredits);
            result.setCreditsEarned(creditsEarned);
            result.setVerifiedAt(null);
            result.setVerifiedBy(null);
            result.setPublishedAt(null);
            result.setPublishedBy(null);

            generatedResults.add(semesterResultRepository.save(result));
        }

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "GENERATE_SEMESTER_RESULTS",
                "SemesterResult",
                "Section:" + request.getSectionId() + ",Sem:" + request.getSemester(),
                "Generated " + generatedResults.size() + " semester results for Section ID " + request.getSectionId() + " (Sem " + request.getSemester() + ", " + request.getAcademicYear() + ")",
                clientIp
        );

        return generatedResults.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. VERIFY RESULTS (ADMIN REVIEW STEP)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<SemesterResultSummaryDto> verifySemesterResults(Long adminUserId, VerifySemesterResultsRequest request, String clientIp) {
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        List<SemesterResult> results = semesterResultRepository
                .findByStudentSectionIdAndSemesterAndAcademicYear(request.getSectionId(), request.getSemester(), request.getAcademicYear());

        if (results.isEmpty()) {
            throw new BadRequestException("No semester results found to verify for this section and semester. Please generate results first.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (SemesterResult r : results) {
            if (r.getStatus() == ResultStatus.DRAFT) {
                r.setStatus(ResultStatus.VERIFIED);
            }
            r.setVerifiedAt(now);
            r.setVerifiedBy(adminUser);
            semesterResultRepository.save(r);
        }

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "VERIFY_SEMESTER_RESULTS",
                "SemesterResult",
                "Section:" + request.getSectionId() + ",Sem:" + request.getSemester(),
                "Verified " + results.size() + " semester results for Section ID " + request.getSectionId() + " (Sem " + request.getSemester() + ", " + request.getAcademicYear() + ")",
                clientIp
        );

        return results.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. PUBLISH SEMESTER RESULTS (OFFICIAL PUBLICATION)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<SemesterResultSummaryDto> publishSemesterResults(Long adminUserId, PublishSemesterResultsRequest request, String clientIp) {
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        List<SemesterResult> results = semesterResultRepository
                .findByStudentSectionIdAndSemesterAndAcademicYear(request.getSectionId(), request.getSemester(), request.getAcademicYear());

        if (results.isEmpty()) {
            throw new BadRequestException("No semester results found to publish for this section and semester. Please generate results first.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (SemesterResult r : results) {
            r.setStatus(ResultStatus.PUBLISHED);
            r.setPublishedAt(now);
            r.setPublishedBy(adminUser);
            semesterResultRepository.save(r);
        }

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "PUBLISH_SEMESTER_RESULTS",
                "SemesterResult",
                "Section:" + request.getSectionId() + ",Sem:" + request.getSemester(),
                "Officially published " + results.size() + " semester results for Section ID " + request.getSectionId() + " (Sem " + request.getSemester() + ", " + request.getAcademicYear() + ")",
                clientIp
        );

        return results.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. SEMESTER TRANSITION (STUDENT COHORT PROMOTION)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public SemesterTransitionResultDto executeSemesterTransition(Long adminUserId, SemesterTransitionRequest request, String clientIp) {
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));

        if (!request.getToSemester().equals(request.getFromSemester() + 1)) {
            throw new BadRequestException("Target semester must be exactly next sequential semester (e.g. Sem " + request.getFromSemester() + " -> Sem " + (request.getFromSemester() + 1) + ").");
        }

        if (request.getToSemester() > 8) {
            throw new BadRequestException("Maximum degree semester is 8. Cannot transition beyond Semester 8.");
        }

        List<StudentProfile> students = studentProfileRepository.findByDepartmentIdAndSectionId(section.getDepartment().getId(), section.getId());
        if (students.isEmpty()) {
            throw new BadRequestException("No students enrolled in section " + section.getName() + " to transition.");
        }

        // Safety verification: ALL students must have PUBLISHED results for fromSemester
        List<SemesterResult> publishedResults = semesterResultRepository
                .findByStudentSectionIdAndSemesterAndAcademicYear(request.getSectionId(), request.getFromSemester(), request.getFromAcademicYear())
                .stream()
                .filter(r -> r.getStatus() == ResultStatus.PUBLISHED)
                .collect(Collectors.toList());

        if (publishedResults.size() < students.size()) {
            throw new BadRequestException("Cannot execute semester transition: Only " + publishedResults.size() + " of "
                    + students.size() + " students have officially PUBLISHED results for Semester "
                    + request.getFromSemester() + " (" + request.getFromAcademicYear() + "). Please publish all results before transitioning.");
        }

        for (StudentProfile student : students) {
            student.setCurrentSemester(request.getToSemester());
            student.setAcademicYear(request.getToAcademicYear());
            studentProfileRepository.save(student);
        }

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "SEMESTER_TRANSITION",
                "StudentProfile",
                "Section:" + request.getSectionId(),
                "Successfully transitioned " + students.size() + " students in Section " + section.getName()
                        + " from Sem " + request.getFromSemester() + " (" + request.getFromAcademicYear()
                        + ") to Sem " + request.getToSemester() + " (" + request.getToAcademicYear() + ")",
                clientIp
        );

        SemesterTransitionResultDto resultDto = new SemesterTransitionResultDto();
        resultDto.setSectionId(section.getId());
        resultDto.setSectionName(section.getName());
        resultDto.setDepartmentName(section.getDepartment().getName());
        resultDto.setTransitionedStudentsCount(students.size());
        resultDto.setPreviousSemester(request.getFromSemester());
        resultDto.setNewSemester(request.getToSemester());
        resultDto.setPreviousAcademicYear(request.getFromAcademicYear());
        resultDto.setNewAcademicYear(request.getToAcademicYear());
        resultDto.setTransitionedAt(LocalDateTime.now());
        resultDto.setStatusMessage("Cohort successfully transitioned to Semester " + request.getToSemester() + " (" + request.getToAcademicYear() + "). Historical results preserved.");

        return resultDto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String deriveGrade(double score) {
        if (score >= 90.0) return "O";
        if (score >= 80.0) return "A+";
        if (score >= 70.0) return "A";
        if (score >= 60.0) return "B+";
        if (score >= 50.0) return "B";
        return "RA";
    }

    private SemesterResultSummaryDto mapToSummaryDto(SemesterResult r) {
        SemesterResultSummaryDto dto = new SemesterResultSummaryDto();
        dto.setId(r.getId());
        dto.setStudentId(r.getStudent().getId());
        dto.setRegisterNumber(r.getStudent().getRegisterNumber());
        dto.setStudentName(r.getStudent().getFullName());
        dto.setSectionId(r.getStudent().getSection().getId());
        dto.setSectionName(r.getStudent().getSection().getName());
        dto.setSemester(r.getSemester());
        dto.setAcademicYear(r.getAcademicYear());
        dto.setActualSemesterScore(r.getActualSemesterScore());
        dto.setPredictedSemesterScore(r.getPredictedSemesterScore());
        dto.setGrade(r.getGrade() != null ? r.getGrade() : deriveGrade(r.getActualSemesterScore() != null ? r.getActualSemesterScore().doubleValue() : 0.0));
        dto.setStatus(r.getStatus() != null ? r.getStatus() : ResultStatus.PUBLISHED);
        dto.setTotalCredits(r.getTotalCredits());
        dto.setCreditsEarned(r.getCreditsEarned());
        dto.setVerifiedAt(r.getVerifiedAt());
        dto.setVerifiedByName(r.getVerifiedBy() != null ? r.getVerifiedBy().getEmail() : null);
        dto.setPublishedAt(r.getPublishedAt());
        dto.setPublishedByName(r.getPublishedBy() != null ? r.getPublishedBy().getEmail() : null);
        return dto;
    }
}
