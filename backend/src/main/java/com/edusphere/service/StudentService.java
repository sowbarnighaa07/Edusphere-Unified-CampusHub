package com.edusphere.service;

import com.edusphere.dto.student.*;
import com.edusphere.dto.achievement.AchievementDto;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final SemesterResultRepository semesterResultRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final ClassroomMaterialRepository classroomMaterialRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final FileStorageService fileStorageService;
    private final StudentPortfolioRepository studentPortfolioRepository;
    private final AchievementRepository achievementRepository;

    public StudentService(StudentProfileRepository studentProfileRepository,
                          SubjectRepository subjectRepository,
                          TeachingAssignmentRepository teachingAssignmentRepository,
                          ClassroomRepository classroomRepository,
                          SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                          SemesterResultRepository semesterResultRepository,
                          StaffProfileRepository staffProfileRepository,
                          HodProfileRepository hodProfileRepository,
                          ClassroomMaterialRepository classroomMaterialRepository,
                          AssignmentRepository assignmentRepository,
                          AssignmentSubmissionRepository assignmentSubmissionRepository,
                          FileStorageService fileStorageService,
                          StudentPortfolioRepository studentPortfolioRepository,
                          AchievementRepository achievementRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.subjectRepository = subjectRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.classroomRepository = classroomRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.semesterResultRepository = semesterResultRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.classroomMaterialRepository = classroomMaterialRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.fileStorageService = fileStorageService;
        this.studentPortfolioRepository = studentPortfolioRepository;
        this.achievementRepository = achievementRepository;
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

    private String deriveGrade(double score) {
        if (score >= 90.0) return "O";
        if (score >= 80.0) return "A+";
        if (score >= 70.0) return "A";
        if (score >= 60.0) return "B+";
        if (score >= 50.0) return "B";
        return "RA";
    }

    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(Long userId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        int currSem = sp.getCurrentSemester() != null ? sp.getCurrentSemester() : deriveCurrentSemester(deriveCurrentYear(sp.getEnrollmentYear()));
        int currYear = sp.getCurrentSemester() != null ? ((currSem + 1) / 2) : deriveCurrentYear(sp.getEnrollmentYear());

        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(sp.getId());
        dto.setUserId(sp.getUser().getId());
        dto.setEmail(sp.getUser().getEmail());
        dto.setRegisterNumber(sp.getRegisterNumber());
        dto.setFullName(sp.getFullName());
        dto.setGender(sp.getGender());
        dto.setDob(sp.getDob());
        dto.setMobileNumber(sp.getMobileNumber());
        dto.setAlternateMobileNumber(sp.getAlternateMobileNumber());
        dto.setDepartmentId(sp.getDepartment().getId());
        dto.setDepartmentName(sp.getDepartment().getName());
        dto.setDepartmentCode(sp.getDepartment().getCode());
        dto.setSectionId(sp.getSection().getId());
        dto.setSectionName(sp.getSection().getName());
        dto.setEnrollmentYear(sp.getEnrollmentYear());
        dto.setExpectedGraduationYear(sp.getExpectedGraduationYear());
        dto.setCurrentYear(currYear);
        dto.setCurrentSemester(currSem);
        dto.setAddress(sp.getAddress());
        dto.setCity(sp.getCity());
        dto.setDistrict(sp.getDistrict());
        dto.setState(sp.getState());
        dto.setPincode(sp.getPincode());
        dto.setFatherName(sp.getFatherName());
        dto.setMotherName(sp.getMotherName());
        dto.setGuardianName(sp.getGuardianName());
        dto.setEmergencyContactName(sp.getEmergencyContactName());
        dto.setEmergencyContactMobile(sp.getEmergencyContactMobile());
        dto.setEmergencyRelationship(sp.getEmergencyRelationship());
        dto.setStatus(sp.getUser().getStatus());
        dto.setCreatedAt(sp.getCreatedAt());
        return dto;
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, UpdateStudentProfileRequest req) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        if (req.getGender() != null) sp.setGender(req.getGender());
        if (req.getDob() != null) sp.setDob(req.getDob());
        if (req.getMobileNumber() != null) sp.setMobileNumber(req.getMobileNumber());
        if (req.getAlternateMobileNumber() != null) sp.setAlternateMobileNumber(req.getAlternateMobileNumber());
        if (req.getAddress() != null) sp.setAddress(req.getAddress());
        if (req.getCity() != null) sp.setCity(req.getCity());
        if (req.getDistrict() != null) sp.setDistrict(req.getDistrict());
        if (req.getState() != null) sp.setState(req.getState());
        if (req.getPincode() != null) sp.setPincode(req.getPincode());
        if (req.getFatherName() != null) sp.setFatherName(req.getFatherName());
        if (req.getMotherName() != null) sp.setMotherName(req.getMotherName());
        if (req.getGuardianName() != null) sp.setGuardianName(req.getGuardianName());
        if (req.getEmergencyContactName() != null) sp.setEmergencyContactName(req.getEmergencyContactName());
        if (req.getEmergencyContactMobile() != null) sp.setEmergencyContactMobile(req.getEmergencyContactMobile());
        if (req.getEmergencyRelationship() != null) sp.setEmergencyRelationship(req.getEmergencyRelationship());

        studentProfileRepository.save(sp);
        return getProfile(userId);
    }

    @Transactional(readOnly = true)
    public StudentAcademicOverviewDto getCurrentAcademicOverview(Long userId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        int currSem = sp.getCurrentSemester() != null ? sp.getCurrentSemester() : deriveCurrentSemester(deriveCurrentYear(sp.getEnrollmentYear()));
        int currYear = sp.getCurrentSemester() != null ? ((currSem + 1) / 2) : deriveCurrentYear(sp.getEnrollmentYear());
        String academicYear = sp.getAcademicYear() != null ? sp.getAcademicYear() : getCurrentAcademicYear();

        List<Subject> subjects = subjectRepository.findByDepartmentIdAndSemester(sp.getDepartment().getId(), currSem);

        List<StudentEnrolledSubjectDto> subjectDtos = new ArrayList<>();
        int totalCredits = 0;
        double attendanceSum = 0.0;
        int attendanceCount = 0;

        for (Subject sub : subjects) {
            totalCredits += sub.getCredits();

            StudentEnrolledSubjectDto dto = new StudentEnrolledSubjectDto();
            dto.setSubjectId(sub.getId());
            dto.setSubjectCode(sub.getCode());
            dto.setSubjectName(sub.getName());
            dto.setSemester(sub.getSemester());
            dto.setCredits(sub.getCredits());

            // Look up teaching assignment for this subject and section
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findBySubjectId(sub.getId());
            Optional<TeachingAssignment> sectionAssignment = assignments.stream()
                    .filter(a -> a.getSection().getId().equals(sp.getSection().getId()))
                    .findFirst();

            if (sectionAssignment.isPresent()) {
                TeachingAssignment ta = sectionAssignment.get();
                dto.setTeachingAssignmentId(ta.getId());
                dto.setFacultyName(ta.getStaff().getFullName());
                dto.setFacultyEmail(ta.getStaff().getUser().getEmail());

                classroomRepository.findByTeachingAssignmentId(ta.getId()).ifPresent(c -> {
                    dto.setClassroomId(c.getId());
                    dto.setClassroomName(c.getName());
                });
            }

            // Look up academic marks / attendance if recorded
            Optional<SubjectAcademicRecord> record = subjectAcademicRecordRepository
                    .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(sp.getId(), sub.getId(), currSem, academicYear);

            if (record.isPresent()) {
                SubjectAcademicRecord r = record.get();
                if (r.getAttendancePercentage() != null) {
                    double att = r.getAttendancePercentage().doubleValue();
                    dto.setAttendancePercentage(att);
                    attendanceSum += att;
                    attendanceCount++;
                }
                if (r.getIat1Score() != null) {
                    dto.setIat1Score(r.getIat1Score().doubleValue());
                }
                if (r.getIat2Score() != null) {
                    dto.setIat2Score(r.getIat2Score().doubleValue());
                }
                if (r.getAssignmentScore() != null) {
                    dto.setAssignmentScore(r.getAssignmentScore().doubleValue());
                }
            }

            subjectDtos.add(dto);
        }

        StudentAcademicOverviewDto overview = new StudentAcademicOverviewDto();
        overview.setRegisterNumber(sp.getRegisterNumber());
        overview.setFullName(sp.getFullName());
        overview.setDepartmentName(sp.getDepartment().getName());
        overview.setDepartmentCode(sp.getDepartment().getCode());
        overview.setSectionName(sp.getSection().getName());
        overview.setCurrentSemester(currSem);
        overview.setCurrentYear(currYear);
        overview.setAcademicYear(academicYear);
        overview.setTotalCredits(totalCredits);
        overview.setAverageAttendancePercentage(attendanceCount > 0 ? Math.round((attendanceSum / attendanceCount) * 100.0) / 100.0 : null);
        overview.setSubjects(subjectDtos);

        return overview;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Multi-Semester Academic History & Results (Phase 12 + Phase 16)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StudentAcademicHistoryDto getMyAcademicHistory(Long userId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return compileAcademicHistory(sp, Role.STUDENT);
    }

    @Transactional(readOnly = true)
    public StudentAcademicHistoryDto getStudentAcademicHistory(Long studentProfileId, Long requestingUserId, Role requestingRole) {
        StudentProfile student = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        // Strict Backend Authorization Checks
        if (requestingRole == Role.ADMIN) {
            // Admin has full institution-wide oversight
        } else if (requestingRole == Role.HOD) {
            HodProfile hod = hodProfileRepository.findByUserId(requestingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", requestingUserId));
            if (!Objects.equals(student.getDepartment().getId(), hod.getDepartment().getId())) {
                throw new UnauthorizedAccessException("You are not authorized to view academic history of students outside your department.");
            }
        } else if (requestingRole == Role.STAFF) {
            StaffProfile staff = staffProfileRepository.findByUserId(requestingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", requestingUserId));
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            boolean authorized = assignments.stream()
                    .anyMatch(ta -> Objects.equals(ta.getSection().getId(), student.getSection().getId()));
            if (!authorized) {
                throw new UnauthorizedAccessException("You are not authorized to view academic history of students outside your assigned teaching classes.");
            }
        } else if (requestingRole == Role.STUDENT) {
            if (!Objects.equals(student.getUser().getId(), requestingUserId)) {
                throw new UnauthorizedAccessException("You can only view your own academic history.");
            }
        } else {
            throw new UnauthorizedAccessException("Unauthorized role to view academic history.");
        }

        return compileAcademicHistory(student, requestingRole);
    }

    private StudentAcademicHistoryDto compileAcademicHistory(StudentProfile sp, Role requestingRole) {
        int currSem = sp.getCurrentSemester() != null ? sp.getCurrentSemester() : deriveCurrentSemester(deriveCurrentYear(sp.getEnrollmentYear()));
        int currYear = sp.getCurrentSemester() != null ? ((currSem + 1) / 2) : deriveCurrentYear(sp.getEnrollmentYear());
        String currentAcademicYear = sp.getAcademicYear() != null ? sp.getAcademicYear() : getCurrentAcademicYear();

        // 1. Fetch all existing SubjectAcademicRecord and SemesterResult for this student
        List<SubjectAcademicRecord> allRecords = subjectAcademicRecordRepository.findByStudentId(sp.getId());
        List<SemesterResult> allSemesterResults = semesterResultRepository.findByStudentIdOrderBySemesterAsc(sp.getId());

        // 2. Collect distinct semesters for which academic records, results, or active enrollment exist
        Set<Integer> distinctSemesters = new TreeSet<>();
        for (SubjectAcademicRecord rec : allRecords) {
            if (rec.getSemester() != null) {
                distinctSemesters.add(rec.getSemester());
            }
        }
        for (SemesterResult sr : allSemesterResults) {
            if (sr.getSemester() != null) {
                distinctSemesters.add(sr.getSemester());
            }
        }
        // Include current active semester
        distinctSemesters.add(currSem);

        List<SemesterHistoryDto> semesterDtos = new ArrayList<>();
        int totalCreditsEarned = 0;
        double overallAttendanceSum = 0.0;
        int overallAttendanceCount = 0;
        int completedSemestersCount = 0;

        for (Integer sem : distinctSemesters) {
            SemesterHistoryDto semDto = new SemesterHistoryDto();
            semDto.setSemester(sem);

            String semAcademicYear = null;
            Optional<SemesterResult> semResultOpt = allSemesterResults.stream()
                    .filter(sr -> Objects.equals(sr.getSemester(), sem))
                    .findFirst();

            boolean isResultVisible = false;
            if (semResultOpt.isPresent()) {
                SemesterResult sr = semResultOpt.get();
                semAcademicYear = sr.getAcademicYear();
                semDto.setPredictedSemesterScore(sr.getPredictedSemesterScore());

                boolean isPublished = (sr.getStatus() == ResultStatus.PUBLISHED || sr.getStatus() == null);
                isResultVisible = isPublished || (requestingRole == Role.ADMIN);

                // Enforce Result Publication Rule:
                // Only published results are visible to students, staff, and HODs.
                // Admin can view draft / verified results.
                if (isPublished) {
                    semDto.setActualSemesterScore(sr.getActualSemesterScore());
                    semDto.setGrade(sr.getGrade());
                    semDto.setStatus(ResultStatus.PUBLISHED);
                    semDto.setPublishedAt(sr.getPublishedAt());
                    semDto.setCreditsEarned(sr.getCreditsEarned());
                    if (sr.getActualSemesterScore() != null) {
                        completedSemestersCount++;
                    }
                } else if (requestingRole == Role.ADMIN) {
                    semDto.setActualSemesterScore(sr.getActualSemesterScore());
                    semDto.setGrade(sr.getGrade());
                    semDto.setStatus(sr.getStatus());
                    semDto.setCreditsEarned(sr.getCreditsEarned());
                } else {
                    // Unpublished result hidden from students, faculty, and HODs
                    semDto.setActualSemesterScore(null);
                    semDto.setGrade(null);
                    semDto.setStatus(sr.getStatus());
                    semDto.setCreditsEarned(null);
                }
            }

            List<SubjectAcademicRecord> semRecords = allRecords.stream()
                    .filter(r -> Objects.equals(r.getSemester(), sem))
                    .collect(Collectors.toList());

            if (semAcademicYear == null && !semRecords.isEmpty()) {
                semAcademicYear = semRecords.get(0).getAcademicYear();
            }
            if (semAcademicYear == null) {
                semAcademicYear = (sem.equals(currSem)) ? currentAcademicYear : "Sem " + sem;
            }
            semDto.setAcademicYear(semAcademicYear);

            List<StudentEnrolledSubjectDto> subjectDtos = new ArrayList<>();
            int semCredits = 0;
            double semAttendanceSum = 0.0;
            int semAttendanceCount = 0;

            if (sem.equals(currSem)) {
                // For current semester, resolve courses from department catalog and active teaching assignments
                List<Subject> currSubjects = subjectRepository.findByDepartmentIdAndSemester(sp.getDepartment().getId(), currSem);
                for (Subject sub : currSubjects) {
                    int subCredits = (sub.getCredits() != null ? sub.getCredits() : 0);
                    semCredits += subCredits;

                    StudentEnrolledSubjectDto sDto = new StudentEnrolledSubjectDto();
                    sDto.setSubjectId(sub.getId());
                    sDto.setSubjectCode(sub.getCode());
                    sDto.setSubjectName(sub.getName());
                    sDto.setSemester(sub.getSemester());
                    sDto.setCredits(sub.getCredits());

                    List<TeachingAssignment> assignments = teachingAssignmentRepository.findBySubjectId(sub.getId());
                    Optional<TeachingAssignment> sectionAssignment = assignments.stream()
                            .filter(a -> a.getSection().getId().equals(sp.getSection().getId()))
                            .findFirst();

                    if (sectionAssignment.isPresent()) {
                        TeachingAssignment ta = sectionAssignment.get();
                        sDto.setTeachingAssignmentId(ta.getId());
                        sDto.setFacultyName(ta.getStaff().getFullName());
                        sDto.setFacultyEmail(ta.getStaff().getUser().getEmail());

                        classroomRepository.findByTeachingAssignmentId(ta.getId()).ifPresent(c -> {
                            sDto.setClassroomId(c.getId());
                            sDto.setClassroomName(c.getName());
                        });
                    }

                    Optional<SubjectAcademicRecord> rOpt = semRecords.stream()
                            .filter(r -> Objects.equals(r.getSubject().getId(), sub.getId()))
                            .findFirst();

                    if (rOpt.isPresent()) {
                        SubjectAcademicRecord r = rOpt.get();
                        if (r.getAttendancePercentage() != null) {
                            double att = r.getAttendancePercentage().doubleValue();
                            sDto.setAttendancePercentage(att);
                            semAttendanceSum += att;
                            semAttendanceCount++;
                            overallAttendanceSum += att;
                            overallAttendanceCount++;
                        }
                        if (r.getIat1Score() != null) sDto.setIat1Score(r.getIat1Score().doubleValue());
                        if (r.getIat2Score() != null) sDto.setIat2Score(r.getIat2Score().doubleValue());
                        if (r.getAssignmentScore() != null) sDto.setAssignmentScore(r.getAssignmentScore().doubleValue());

                        if (isResultVisible) {
                            if (r.getFinalScore() != null) {
                                double fScore = r.getFinalScore().doubleValue();
                                sDto.setFinalScore(fScore);
                                sDto.setGrade(r.getGrade() != null ? r.getGrade() : deriveGrade(fScore));
                                sDto.setResult(r.getResult() != null ? r.getResult() : (fScore >= 50.0 ? "PASS" : "RA"));
                                sDto.setCreditsEarned(fScore >= 50.0 ? subCredits : 0);
                            } else if (r.getIat1Score() != null && r.getIat2Score() != null && r.getAssignmentScore() != null && r.getAttendancePercentage() != null) {
                                double calcScore = (r.getIat1Score().doubleValue() / 50.0) * 35.0
                                        + (r.getIat2Score().doubleValue() / 50.0) * 35.0
                                        + (r.getAssignmentScore().doubleValue() / 25.0) * 20.0
                                        + (r.getAttendancePercentage().doubleValue() / 100.0) * 10.0;
                                calcScore = Math.max(0.0, Math.min(100.0, Math.round(calcScore * 100.0) / 100.0));
                                sDto.setFinalScore(calcScore);
                                sDto.setGrade(deriveGrade(calcScore));
                                sDto.setResult(calcScore >= 50.0 ? "PASS" : "RA");
                                sDto.setCreditsEarned(calcScore >= 50.0 ? subCredits : 0);
                            }
                        }
                    }

                    subjectDtos.add(sDto);
                }
            } else {
                // For past semesters, build from existing SubjectAcademicRecords
                for (SubjectAcademicRecord r : semRecords) {
                    Subject sub = r.getSubject();
                    int subCredits = (sub != null && sub.getCredits() != null) ? sub.getCredits() : 0;
                    semCredits += subCredits;

                    StudentEnrolledSubjectDto sDto = new StudentEnrolledSubjectDto();
                    if (sub != null) {
                        sDto.setSubjectId(sub.getId());
                        sDto.setSubjectCode(sub.getCode());
                        sDto.setSubjectName(sub.getName());
                        sDto.setSemester(sub.getSemester());
                        sDto.setCredits(sub.getCredits());
                    }
                    if (r.getAttendancePercentage() != null) {
                        double att = r.getAttendancePercentage().doubleValue();
                        sDto.setAttendancePercentage(att);
                        semAttendanceSum += att;
                        semAttendanceCount++;
                        overallAttendanceSum += att;
                        overallAttendanceCount++;
                    }
                    if (r.getIat1Score() != null) sDto.setIat1Score(r.getIat1Score().doubleValue());
                    if (r.getIat2Score() != null) sDto.setIat2Score(r.getIat2Score().doubleValue());
                    if (r.getAssignmentScore() != null) sDto.setAssignmentScore(r.getAssignmentScore().doubleValue());

                    if (isResultVisible) {
                        if (r.getFinalScore() != null) {
                            double fScore = r.getFinalScore().doubleValue();
                            sDto.setFinalScore(fScore);
                            sDto.setGrade(r.getGrade() != null ? r.getGrade() : deriveGrade(fScore));
                            sDto.setResult(r.getResult() != null ? r.getResult() : (fScore >= 50.0 ? "PASS" : "RA"));
                            sDto.setCreditsEarned(fScore >= 50.0 ? subCredits : 0);
                        } else if (r.getIat1Score() != null && r.getIat2Score() != null && r.getAssignmentScore() != null && r.getAttendancePercentage() != null) {
                            double calcScore = (r.getIat1Score().doubleValue() / 50.0) * 35.0
                                    + (r.getIat2Score().doubleValue() / 50.0) * 35.0
                                    + (r.getAssignmentScore().doubleValue() / 25.0) * 20.0
                                    + (r.getAttendancePercentage().doubleValue() / 100.0) * 10.0;
                            calcScore = Math.max(0.0, Math.min(100.0, Math.round(calcScore * 100.0) / 100.0));
                            sDto.setFinalScore(calcScore);
                            sDto.setGrade(deriveGrade(calcScore));
                            sDto.setResult(calcScore >= 50.0 ? "PASS" : "RA");
                            sDto.setCreditsEarned(calcScore >= 50.0 ? subCredits : 0);
                        }
                    }

                    subjectDtos.add(sDto);
                }
            }

            semDto.setTotalCredits(semCredits);
            totalCreditsEarned += semCredits;

            if (semAttendanceCount > 0) {
                semDto.setAverageAttendancePercentage(
                        BigDecimal.valueOf(semAttendanceSum / semAttendanceCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
                );
            }
            semDto.setSubjects(subjectDtos);

            semesterDtos.add(semDto);
        }

        StudentAcademicHistoryDto historyDto = new StudentAcademicHistoryDto();
        historyDto.setStudentProfileId(sp.getId());
        historyDto.setRegisterNumber(sp.getRegisterNumber());
        historyDto.setFullName(sp.getFullName());
        historyDto.setDepartmentCode(sp.getDepartment() != null ? sp.getDepartment().getCode() : "");
        historyDto.setDepartmentName(sp.getDepartment() != null ? sp.getDepartment().getName() : "");
        historyDto.setSectionName(sp.getSection() != null ? sp.getSection().getName() : "");
        historyDto.setEnrollmentYear(sp.getEnrollmentYear());
        historyDto.setCurrentYear(currYear);
        historyDto.setCurrentSemester(currSem);
        historyDto.setTotalCreditsEarned(totalCreditsEarned);
        if (overallAttendanceCount > 0) {
            historyDto.setCumulativeAverageAttendance(
                    BigDecimal.valueOf(overallAttendanceSum / overallAttendanceCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
            );
        }
        historyDto.setCompletedSemestersCount(completedSemestersCount);
        historyDto.setSemesters(semesterDtos);

        return historyDto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Virtual Classrooms (Batch 1)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentClassroomDto> getStudentClassrooms(Long userId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        int currSem = sp.getCurrentSemester() != null ? sp.getCurrentSemester() : deriveCurrentSemester(deriveCurrentYear(sp.getEnrollmentYear()));

        List<TeachingAssignment> assignments = teachingAssignmentRepository.findBySectionId(sp.getSection().getId())
                .stream()
                .filter(ta -> Objects.equals(ta.getSemester(), currSem))
                .collect(Collectors.toList());

        List<StudentClassroomDto> result = new ArrayList<>();
        for (TeachingAssignment ta : assignments) {
            Optional<Classroom> classroomOpt = classroomRepository.findByTeachingAssignmentId(ta.getId());
            if (classroomOpt.isPresent()) {
                Classroom c = classroomOpt.get();
                StudentClassroomDto dto = new StudentClassroomDto();
                dto.setClassroomId(c.getId());
                dto.setTeachingAssignmentId(ta.getId());
                dto.setName(c.getName());
                dto.setDescription(c.getDescription());
                dto.setIsActive(c.getIsActive());

                if (ta.getSubject() != null) {
                    dto.setSubjectId(ta.getSubject().getId());
                    dto.setSubjectCode(ta.getSubject().getCode());
                    dto.setSubjectName(ta.getSubject().getName());
                    dto.setCredits(ta.getSubject().getCredits());
                    if (ta.getSubject().getDepartment() != null) {
                        dto.setDepartmentCode(ta.getSubject().getDepartment().getCode());
                        dto.setDepartmentName(ta.getSubject().getDepartment().getName());
                    }
                }

                dto.setSemester(ta.getSemester());
                dto.setAcademicYear(ta.getAcademicYear());

                if (ta.getSection() != null) {
                    dto.setSectionId(ta.getSection().getId());
                    dto.setSectionName(ta.getSection().getName());
                }

                if (ta.getStaff() != null) {
                    dto.setFacultyName(ta.getStaff().getFullName());
                    if (ta.getStaff().getUser() != null) {
                        dto.setFacultyEmail(ta.getStaff().getUser().getEmail());
                    }
                }

                int matCount = classroomMaterialRepository.findByClassroomIdOrderByCreatedAtDesc(c.getId()).size();
                dto.setMaterialCount(matCount);

                int assignCount = assignmentRepository.findByTeachingAssignmentIdOrderByDeadlineAsc(ta.getId()).size();
                dto.setAssignmentCount(assignCount);

                result.add(dto);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<StudentClassroomMaterialDto> getStudentClassroomMaterials(Long userId, Long classroomId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", classroomId));

        if (!classroom.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view materials for this classroom.");
        }

        List<ClassroomMaterial> materials = classroomMaterialRepository.findByClassroomIdOrderByCreatedAtDesc(classroomId);
        List<StudentClassroomMaterialDto> result = new ArrayList<>();
        for (ClassroomMaterial m : materials) {
            StudentClassroomMaterialDto dto = new StudentClassroomMaterialDto();
            dto.setId(m.getId());
            dto.setClassroomId(m.getClassroom().getId());
            dto.setTitle(m.getTitle());
            dto.setDescription(m.getDescription());
            dto.setFileName(m.getFileName());
            dto.setFilePath(m.getFilePath());
            if (m.getUploadedBy() != null) {
                dto.setUploadedByName(m.getUploadedBy().getEmail());
            }
            dto.setCreatedAt(m.getCreatedAt());
            result.add(dto);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public ClassroomMaterial getMaterialForStudentDownload(Long userId, Long classroomId, Long materialId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", classroomId));

        if (!classroom.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to access this material.");
        }

        ClassroomMaterial material = classroomMaterialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassroomMaterial", "id", materialId));

        if (!material.getClassroom().getId().equals(classroomId)) {
            throw new ResourceNotFoundException("ClassroomMaterial", "id", materialId);
        }

        return material;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Coursework Assignments (Batch 2)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentAssignmentDto> getStudentAssignments(Long userId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        int currSem = sp.getCurrentSemester() != null ? sp.getCurrentSemester() : deriveCurrentSemester(deriveCurrentYear(sp.getEnrollmentYear()));

        List<Assignment> assignments = assignmentRepository.findByTeachingAssignmentSectionIdOrderByDeadlineAsc(sp.getSection().getId())
                .stream()
                .filter(a -> a.getTeachingAssignment() != null && Objects.equals(a.getTeachingAssignment().getSemester(), currSem))
                .collect(Collectors.toList());

        List<StudentAssignmentDto> result = new ArrayList<>();
        for (Assignment a : assignments) {
            result.add(mapToStudentAssignmentDto(a, sp));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public StudentAssignmentDto getStudentAssignment(Long userId, Long assignmentId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        if (!a.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this assignment.");
        }

        return mapToStudentAssignmentDto(a, sp);
    }

    @Transactional(readOnly = true)
    public StudentAssignmentSubmissionDto getStudentSubmission(Long userId, Long assignmentId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        if (!a.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this assignment's submission.");
        }

        Optional<AssignmentSubmission> subOpt = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, sp.getId());
        return subOpt.map(this::mapToSubmissionDto).orElse(null);
    }

    @Transactional
    public StudentAssignmentSubmissionDto submitAssignment(Long userId, Long assignmentId, String remarks, MultipartFile file) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        if (!assignment.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to submit to this assignment.");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean isLate = now.isAfter(assignment.getDeadline());
        SubmissionStatus newStatus = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

        Optional<AssignmentSubmission> existingOpt = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, sp.getId());

        AssignmentSubmission submission;
        if (existingOpt.isPresent()) {
            submission = existingOpt.get();
            if (submission.getStatus() == SubmissionStatus.EVALUATED) {
                throw new BadRequestException("This assignment has already been evaluated and cannot be resubmitted.");
            }
            submission.setSubmissionDate(now);
            submission.setStatus(newStatus);
            if (remarks != null) {
                submission.setRemarks(remarks);
            }
            if (file != null && !file.isEmpty()) {
                String storedPath = fileStorageService.storeFile(file, "submissions");
                submission.setFilePath(storedPath);
                submission.setFileName(file.getOriginalFilename());
            }
        } else {
            submission = new AssignmentSubmission();
            submission.setAssignment(assignment);
            submission.setStudent(sp);
            submission.setSubmissionDate(now);
            submission.setStatus(newStatus);
            submission.setRemarks(remarks != null ? remarks : "");

            if (file != null && !file.isEmpty()) {
                String storedPath = fileStorageService.storeFile(file, "submissions");
                submission.setFilePath(storedPath);
                submission.setFileName(file.getOriginalFilename());
            } else {
                submission.setFilePath("");
                submission.setFileName("");
            }
        }

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);
        return mapToSubmissionDto(saved);
    }

    @Transactional(readOnly = true)
    public Assignment getAssignmentForStudentAttachmentDownload(Long userId, Long assignmentId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        if (!assignment.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to download this assignment's attachment.");
        }

        return assignment;
    }

    @Transactional(readOnly = true)
    public AssignmentSubmission getStudentSubmissionForDownload(Long userId, Long assignmentId) {
        StudentProfile sp = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        if (!assignment.getTeachingAssignment().getSection().getId().equals(sp.getSection().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to access this assignment.");
        }

        return assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, sp.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "assignmentId", assignmentId));
    }

    private StudentAssignmentDto mapToStudentAssignmentDto(Assignment a, StudentProfile sp) {
        StudentAssignmentDto dto = new StudentAssignmentDto();
        dto.setId(a.getId());
        dto.setTeachingAssignmentId(a.getTeachingAssignment().getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setDeadline(a.getDeadline());
        dto.setMaxMarks(a.getMaxMarks());
        dto.setAttachmentPath(a.getAttachmentPath());
        if (a.getAttachmentPath() != null && !a.getAttachmentPath().isBlank()) {
            String path = a.getAttachmentPath();
            dto.setAttachmentName(path.substring(path.lastIndexOf('/') + 1));
        }
        dto.setCreatedAt(a.getCreatedAt());

        TeachingAssignment ta = a.getTeachingAssignment();
        if (ta.getSubject() != null) {
            dto.setSubjectId(ta.getSubject().getId());
            dto.setSubjectCode(ta.getSubject().getCode());
            dto.setSubjectName(ta.getSubject().getName());
            dto.setCredits(ta.getSubject().getCredits());
            dto.setSemester(ta.getSemester());
            dto.setAcademicYear(ta.getAcademicYear());
            if (ta.getSubject().getDepartment() != null) {
                dto.setDepartmentCode(ta.getSubject().getDepartment().getCode());
                dto.setDepartmentName(ta.getSubject().getDepartment().getName());
            }
        }

        if (ta.getSection() != null) {
            dto.setSectionId(ta.getSection().getId());
            dto.setSectionName(ta.getSection().getName());
        }

        if (ta.getStaff() != null) {
            dto.setFacultyName(ta.getStaff().getFullName());
            if (ta.getStaff().getUser() != null) {
                dto.setFacultyEmail(ta.getStaff().getUser().getEmail());
            }
        }

        // Submission state for this student
        Optional<AssignmentSubmission> subOpt = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(a.getId(), sp.getId());
        if (subOpt.isPresent()) {
            AssignmentSubmission sub = subOpt.get();
            dto.setSubmissionId(sub.getId());
            dto.setSubmissionDate(sub.getSubmissionDate());
            dto.setSubmissionFileName(sub.getFileName());
            dto.setSubmissionFilePath(sub.getFilePath());
            dto.setSubmissionRemarks(sub.getRemarks());
            dto.setMarksObtained(sub.getMarksObtained());
            dto.setSubmissionStatus(sub.getStatus());
            dto.setFeedback(sub.getFeedback());
            dto.setEvaluatedAt(sub.getEvaluatedAt());
            if (sub.getEvaluatedBy() != null) {
                dto.setEvaluatedByName(sub.getEvaluatedBy().getFullName());
            }
            dto.setSubmitted(true);
            dto.setEvaluated(sub.getStatus() == SubmissionStatus.EVALUATED);
            dto.setLate(sub.getStatus() == SubmissionStatus.LATE);
        } else {
            dto.setSubmitted(false);
            dto.setEvaluated(false);
            dto.setLate(LocalDateTime.now().isAfter(a.getDeadline()));
        }

        return dto;
    }

    private StudentAssignmentSubmissionDto mapToSubmissionDto(AssignmentSubmission sub) {
        StudentAssignmentSubmissionDto dto = new StudentAssignmentSubmissionDto();
        dto.setId(sub.getId());
        dto.setAssignmentId(sub.getAssignment().getId());
        dto.setAssignmentTitle(sub.getAssignment().getTitle());
        dto.setStudentProfileId(sub.getStudent().getId());
        dto.setStudentName(sub.getStudent().getFullName());
        dto.setStudentRegisterNumber(sub.getStudent().getRegisterNumber());
        dto.setSubmissionDate(sub.getSubmissionDate());
        dto.setFileName(sub.getFileName());
        dto.setFilePath(sub.getFilePath());
        dto.setRemarks(sub.getRemarks());
        dto.setMarksObtained(sub.getMarksObtained());
        dto.setStatus(sub.getStatus());
        dto.setFeedback(sub.getFeedback());
        dto.setEvaluatedAt(sub.getEvaluatedAt());
        if (sub.getEvaluatedBy() != null) {
            dto.setEvaluatedByName(sub.getEvaluatedBy().getFullName());
        }
        dto.setCreatedAt(sub.getCreatedAt());
        return dto;
    }

    // ─── Step 6: Student Digital Portfolio (Batch 5A) ──────────────────────────

    @Transactional(readOnly = true)
    public StudentPortfolioDto getPortfolio(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        StudentPortfolio portfolio = studentPortfolioRepository.findByStudentId(student.getId())
                .orElse(null);

        StudentPortfolioDto dto = new StudentPortfolioDto();
        dto.setStudentProfileId(student.getId());
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setFullName(student.getFullName());
        dto.setEmail(student.getUser().getEmail());
        dto.setDepartmentName(student.getDepartment().getName());
        dto.setDepartmentCode(student.getDepartment().getCode());
        dto.setSectionName(student.getSection().getName());
        dto.setEnrollmentYear(student.getEnrollmentYear());
        dto.setExpectedGraduationYear(student.getExpectedGraduationYear());

        if (portfolio != null) {
            dto.setAbout(portfolio.getAbout());
            dto.setSkills(portfolio.getSkills());
            dto.setProjects(portfolio.getProjects());
            dto.setCareerObjective(portfolio.getCareerObjective());
            dto.setGithubUrl(portfolio.getGithubUrl());
            dto.setLinkedinUrl(portfolio.getLinkedinUrl());
        }

        List<Achievement> achievements = achievementRepository.findByStudentIdOrderByAchievementDateDesc(student.getId());
        List<AchievementDto> verifiedAchievements = achievements.stream()
                .filter(a -> a.getStatus() == AchievementStatus.VERIFIED)
                .map(this::mapToAchievementDto)
                .collect(Collectors.toList());
        dto.setVerifiedAchievements(verifiedAchievements);

        return dto;
    }

    @Transactional
    public StudentPortfolioDto updatePortfolio(Long userId, UpdateStudentPortfolioRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        StudentPortfolio portfolio = studentPortfolioRepository.findByStudentId(student.getId())
                .orElseGet(() -> {
                    StudentPortfolio p = new StudentPortfolio();
                    p.setStudent(student);
                    return p;
                });

        portfolio.setAbout(request.getAbout());
        portfolio.setSkills(request.getSkills());
        portfolio.setProjects(request.getProjects());
        portfolio.setCareerObjective(request.getCareerObjective());
        portfolio.setGithubUrl(request.getGithubUrl());
        portfolio.setLinkedinUrl(request.getLinkedinUrl());

        studentPortfolioRepository.save(portfolio);
        return getPortfolio(userId);
    }

    private AchievementDto mapToAchievementDto(Achievement a) {
        AchievementDto dto = new AchievementDto();
        dto.setId(a.getId());
        dto.setStudentProfileId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getFullName());
        dto.setStudentRegisterNumber(a.getStudent().getRegisterNumber());
        dto.setDepartmentName(a.getStudent().getDepartment().getName());
        dto.setDepartmentCode(a.getStudent().getDepartment().getCode());
        dto.setSectionName(a.getStudent().getSection().getName());
        dto.setCategory(a.getCategory());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setAchievementDate(a.getAchievementDate());
        dto.setCertificatePath(a.getCertificatePath());
        dto.setStatus(a.getStatus());
        if (a.getVerifiedBy() != null) {
            dto.setVerifiedById(a.getVerifiedBy().getId());
            dto.setVerifiedByName(a.getVerifiedBy().getFullName());
        }
        dto.setVerifiedAt(a.getVerifiedAt());
        dto.setRemarks(a.getRemarks());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
