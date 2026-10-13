package com.edusphere.service;

import com.edusphere.dto.hod.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HodService {

    private final HodProfileRepository hodProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AchievementRepository achievementRepository;

    public HodService(HodProfileRepository hodProfileRepository,
                      DepartmentRepository departmentRepository,
                      SectionRepository sectionRepository,
                      SubjectRepository subjectRepository,
                      StaffProfileRepository staffProfileRepository,
                      StudentProfileRepository studentProfileRepository,
                      TeachingAssignmentRepository teachingAssignmentRepository,
                      SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                      LeaveRequestRepository leaveRequestRepository,
                      AssignmentRepository assignmentRepository,
                      AssignmentSubmissionRepository assignmentSubmissionRepository,
                      AchievementRepository achievementRepository) {
        this.hodProfileRepository = hodProfileRepository;
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.achievementRepository = achievementRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Department Overview
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HodDepartmentOverviewDto getDepartmentOverview(Long userId, Role userRole, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        HodDepartmentOverviewDto dto = new HodDepartmentOverviewDto();
        dto.setDepartmentId(dept.getId());
        dto.setDepartmentCode(dept.getCode());
        dto.setDepartmentName(dept.getName());

        // HOD profile details
        Optional<HodProfile> hodOpt = hodProfileRepository.findByDepartmentIdAndIsActiveTrue(dept.getId());
        if (hodOpt.isPresent()) {
            HodProfile hod = hodOpt.get();
            dto.setHodName(hod.getFullName());
            dto.setHodDesignation(hod.getDesignation());
            dto.setHodEmployeeId(hod.getEmployeeId());
        } else {
            dto.setHodName("Vacant / Unassigned");
            dto.setHodDesignation("Head of Department");
            dto.setHodEmployeeId("N/A");
        }

        // Aggregate statistics from MySQL
        long studentCount = studentProfileRepository.countByDepartmentId(dept.getId());
        long facultyCount = staffProfileRepository.countByDepartmentId(dept.getId());
        List<Subject> subjects = subjectRepository.findByDepartmentId(dept.getId());
        List<Section> sections = sectionRepository.findByDepartmentId(dept.getId());
        long pendingLeaves = leaveRequestRepository.countByStudentDepartmentIdAndStatus(dept.getId(), LeaveStatus.PENDING_HOD);

        Set<Integer> activeSemesters = subjects.stream()
                .map(Subject::getSemester)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        dto.setTotalStudents(studentCount);
        dto.setTotalFaculty(facultyCount);
        dto.setTotalSubjects(subjects.size());
        dto.setTotalSections(sections.size());
        dto.setPendingLeaveRequests(pendingLeaves);
        dto.setActiveSemesters(activeSemesters.size());

        // Section breakdown
        List<HodDepartmentOverviewDto.SectionSummaryDto> sectionSummaries = new ArrayList<>();
        for (Section sec : sections) {
            HodDepartmentOverviewDto.SectionSummaryDto secDto = new HodDepartmentOverviewDto.SectionSummaryDto();
            secDto.setSectionId(sec.getId());
            secDto.setSectionName(sec.getName());
            secDto.setStudentCount(studentProfileRepository.findByDepartmentIdAndSectionId(dept.getId(), sec.getId()).size());
            sectionSummaries.add(secDto);
        }
        dto.setSections(sectionSummaries);

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Department Student Directory & Monitoring
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<HodStudentDto> getDepartmentStudents(Long userId, Role userRole, Long sectionId, Integer enrollmentYear, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<StudentProfile> students;
        if (sectionId != null) {
            students = studentProfileRepository.findByDepartmentIdAndSectionId(dept.getId(), sectionId);
        } else {
            students = studentProfileRepository.findByDepartmentId(dept.getId());
        }

        if (enrollmentYear != null) {
            students = students.stream()
                    .filter(s -> Objects.equals(s.getEnrollmentYear(), enrollmentYear))
                    .collect(Collectors.toList());
        }

        int currentYearCalendar = LocalDateTime.now().getYear();

        List<HodStudentDto> dtos = new ArrayList<>();
        for (StudentProfile st : students) {
            HodStudentDto dto = new HodStudentDto();
            dto.setStudentProfileId(st.getId());
            dto.setRegisterNumber(st.getRegisterNumber());
            dto.setFullName(st.getFullName());
            dto.setEmail(st.getUser() != null ? st.getUser().getEmail() : "");
            dto.setMobileNumber(st.getMobileNumber());
            dto.setSectionId(st.getSection() != null ? st.getSection().getId() : null);
            dto.setSectionName(st.getSection() != null ? st.getSection().getName() : "N/A");
            dto.setEnrollmentYear(st.getEnrollmentYear());
            dto.setExpectedGraduationYear(st.getExpectedGraduationYear());
            dto.setCurrentYear(st.getDerivedCurrentYear(currentYearCalendar));
            dto.setStatus(st.getUser() != null ? st.getUser().getStatus().name() : "ACTIVE");

            // Calculate overall attendance across registered subjects
            List<SubjectAcademicRecord> records = subjectAcademicRecordRepository.findByStudentId(st.getId());
            dto.setTotalSubjectsCount(records.size());

            List<BigDecimal> attendanceValues = records.stream()
                    .map(SubjectAcademicRecord::getAttendancePercentage)
                    .filter(Objects::nonNull)
                    .toList();

            if (!attendanceValues.isEmpty()) {
                double avg = attendanceValues.stream()
                        .mapToDouble(BigDecimal::doubleValue)
                        .average()
                        .orElse(0.0);
                dto.setOverallAttendancePercentage(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            } else {
                dto.setOverallAttendancePercentage(null);
            }

            dtos.add(dto);
        }

        return dtos;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Faculty Overview & Workload Allocation
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<HodFacultyDto> getDepartmentFaculty(Long userId, Role userRole, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<StaffProfile> facultyList = staffProfileRepository.findByDepartmentId(dept.getId());

        List<HodFacultyDto> dtos = new ArrayList<>();
        for (StaffProfile staff : facultyList) {
            HodFacultyDto dto = new HodFacultyDto();
            dto.setStaffProfileId(staff.getId());
            dto.setEmployeeId(staff.getEmployeeId());
            dto.setFullName(staff.getFullName());
            dto.setEmail(staff.getUser() != null ? staff.getUser().getEmail() : "");
            dto.setDesignation(staff.getDesignation());
            dto.setQualification(staff.getQualification());
            dto.setJoiningYear(staff.getJoiningYear());
            dto.setMobileNumber(staff.getMobileNumber());

            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            dto.setAssignedClassesCount(assignments.size());

            List<HodFacultyDto.FacultyTeachingAssignmentDto> assignmentDtos = new ArrayList<>();
            for (TeachingAssignment ta : assignments) {
                HodFacultyDto.FacultyTeachingAssignmentDto aDto = new HodFacultyDto.FacultyTeachingAssignmentDto();
                aDto.setTeachingAssignmentId(ta.getId());
                aDto.setSubjectId(ta.getSubject().getId());
                aDto.setSubjectCode(ta.getSubject().getCode());
                aDto.setSubjectName(ta.getSubject().getName());
                aDto.setSectionId(ta.getSection().getId());
                aDto.setSectionName(ta.getSection().getName());
                aDto.setSemester(ta.getSemester());
                aDto.setAcademicYear(ta.getAcademicYear());
                aDto.setCredits(ta.getSubject().getCredits());
                assignmentDtos.add(aDto);
            }
            dto.setTeachingAssignments(assignmentDtos);

            dtos.add(dto);
        }

        return dtos;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Department Attendance Analytics & Defaulters
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HodAttendanceAnalyticsDto getAttendanceAnalytics(Long userId, Role userRole, Integer semesterFilter, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<Subject> subjects = subjectRepository.findByDepartmentId(dept.getId());
        if (semesterFilter != null) {
            subjects = subjects.stream()
                    .filter(s -> Objects.equals(s.getSemester(), semesterFilter))
                    .collect(Collectors.toList());
        }

        List<HodAttendanceAnalyticsDto.SubjectAttendanceStatDto> subjectStats = new ArrayList<>();
        List<HodAttendanceAnalyticsDto.AttendanceDefaulterDto> defaulters = new ArrayList<>();

        double totalAttendanceSum = 0;
        int totalValidRecordsCount = 0;
        Set<Long> uniqueStudents = new HashSet<>();

        for (Subject sub : subjects) {
            // Fetch all teaching assignments for this subject
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findBySubjectId(sub.getId());

            double subAttendanceSum = 0;
            int subValidCount = 0;
            int subDefaulterCount = 0;

            for (TeachingAssignment ta : assignments) {
                List<SubjectAcademicRecord> records = subjectAcademicRecordRepository
                        .findBySubjectIdAndSemesterAndAcademicYear(sub.getId(), ta.getSemester(), ta.getAcademicYear());

                for (SubjectAcademicRecord rec : records) {
                    if (rec.getAttendancePercentage() != null) {
                        double att = rec.getAttendancePercentage().doubleValue();
                        subAttendanceSum += att;
                        subValidCount++;
                        totalAttendanceSum += att;
                        totalValidRecordsCount++;

                        if (rec.getStudent() != null) {
                            uniqueStudents.add(rec.getStudent().getId());
                            if (att < 75.0) {
                                subDefaulterCount++;
                                HodAttendanceAnalyticsDto.AttendanceDefaulterDto defDto = new HodAttendanceAnalyticsDto.AttendanceDefaulterDto();
                                defDto.setStudentProfileId(rec.getStudent().getId());
                                defDto.setRegisterNumber(rec.getStudent().getRegisterNumber());
                                defDto.setStudentName(rec.getStudent().getFullName());
                                defDto.setSectionName(rec.getStudent().getSection() != null ? rec.getStudent().getSection().getName() : "N/A");
                                defDto.setSubjectCode(sub.getCode());
                                defDto.setSubjectName(sub.getName());
                                defDto.setSemester(ta.getSemester());
                                defDto.setAttendancePercentage(BigDecimal.valueOf(att).setScale(2, RoundingMode.HALF_UP).doubleValue());
                                defaulters.add(defDto);
                            }
                        }
                    }
                }
            }

            HodAttendanceAnalyticsDto.SubjectAttendanceStatDto sStat = new HodAttendanceAnalyticsDto.SubjectAttendanceStatDto();
            sStat.setSubjectId(sub.getId());
            sStat.setSubjectCode(sub.getCode());
            sStat.setSubjectName(sub.getName());
            sStat.setSemester(sub.getSemester());
            sStat.setTotalRecords(subValidCount);
            sStat.setAverageAttendance(subValidCount > 0 ? BigDecimal.valueOf(subAttendanceSum / subValidCount).setScale(2, RoundingMode.HALF_UP).doubleValue() : 0.0);
            sStat.setDefaulterCount(subDefaulterCount);
            subjectStats.add(sStat);
        }

        HodAttendanceAnalyticsDto analytics = new HodAttendanceAnalyticsDto();
        analytics.setDepartmentId(dept.getId());
        analytics.setDepartmentCode(dept.getCode());
        analytics.setTotalEnrolledStudents(uniqueStudents.size());
        analytics.setDepartmentAverageAttendance(totalValidRecordsCount > 0
                ? BigDecimal.valueOf(totalAttendanceSum / totalValidRecordsCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0);
        analytics.setTotalDefaultersCount(defaulters.size());
        analytics.setSubjectStats(subjectStats);
        analytics.setDefaulters(defaulters);

        return analytics;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Leave Approvals (Final Stage)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<HodLeaveReviewDto> getDepartmentLeaveRequests(Long userId, Role userRole, LeaveStatus statusFilter, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<LeaveRequest> requests;
        if (statusFilter != null) {
            requests = leaveRequestRepository.findByStudentDepartmentIdAndStatusOrderByCreatedAtDesc(dept.getId(), statusFilter);
        } else {
            requests = leaveRequestRepository.findByStudentDepartmentIdOrderByCreatedAtDesc(dept.getId());
        }

        return requests.stream().map(this::toLeaveDto).collect(Collectors.toList());
    }

    @Transactional
    public HodLeaveReviewDto decideLeaveRequest(Long userId, Role userRole, Long leaveId, HodLeaveDecisionRequest decision) {
        if (decision.getStatus() != LeaveStatus.APPROVED && decision.getStatus() != LeaveStatus.REJECTED) {
            throw new BadRequestException("HOD decision status must be APPROVED or REJECTED.");
        }

        LeaveRequest lr = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        Department dept = resolveDepartment(userId, userRole, null);
        if (!Objects.equals(lr.getStudent().getDepartment().getId(), dept.getId()) && userRole != Role.ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to review leave requests for students outside your department.");
        }

        if (userRole == Role.HOD) {
            HodProfile hod = hodProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));
            lr.setHodReviewer(hod);
        }
        lr.setHodReviewedAt(LocalDateTime.now());
        lr.setHodRemarks(decision.getRemarks());
        lr.setStatus(decision.getStatus());

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return toLeaveDto(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: Resolve Target Department with Authorization
    // ─────────────────────────────────────────────────────────────────────────
    private Department resolveDepartment(Long userId, Role userRole, Long targetDeptId) {
        if (userRole == Role.ADMIN) {
            if (targetDeptId != null) {
                return departmentRepository.findById(targetDeptId)
                        .orElseThrow(() -> new ResourceNotFoundException("Department", "id", targetDeptId));
            }
            return departmentRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "default", "none found"));
        }

        HodProfile hod = hodProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));

        if (!Boolean.TRUE.equals(hod.getIsActive())) {
            throw new UnauthorizedAccessException("Your HOD tenure is currently inactive. Contact the administrator.");
        }

        return hod.getDepartment();
    }

    private HodLeaveReviewDto toLeaveDto(LeaveRequest lr) {
        HodLeaveReviewDto dto = new HodLeaveReviewDto();
        dto.setId(lr.getId());
        if (lr.getStudent() != null) {
            dto.setStudentProfileId(lr.getStudent().getId());
            dto.setRegisterNumber(lr.getStudent().getRegisterNumber());
            dto.setStudentName(lr.getStudent().getFullName());
            dto.setDepartmentName(lr.getStudent().getDepartment() != null ? lr.getStudent().getDepartment().getName() : "");
            dto.setSectionName(lr.getStudent().getSection() != null ? lr.getStudent().getSection().getName() : "");
        }
        dto.setLeaveType(lr.getLeaveType());
        dto.setFromDate(lr.getFromDate());
        dto.setToDate(lr.getToDate());
        dto.setReason(lr.getReason());
        dto.setAttachmentPath(lr.getAttachmentPath());
        dto.setStatus(lr.getStatus());

        if (lr.getStaffReviewer() != null) {
            dto.setStaffReviewerName(lr.getStaffReviewer().getFullName());
        }
        dto.setStaffRemarks(lr.getStaffRemarks());
        dto.setStaffReviewedAt(lr.getStaffReviewedAt());

        if (lr.getHodReviewer() != null) {
            dto.setHodReviewerName(lr.getHodReviewer().getFullName());
        }
        dto.setHodRemarks(lr.getHodRemarks());
        dto.setHodReviewedAt(lr.getHodReviewedAt());
        dto.setCreatedAt(lr.getCreatedAt());

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. HOD Profile (Batch 5C)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HodProfileDto getHodProfile(Long userId) {
        HodProfile hod = hodProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));

        HodProfileDto dto = new HodProfileDto();
        dto.setId(hod.getId());
        dto.setUserId(hod.getUser().getId());
        dto.setEmail(hod.getUser().getEmail());
        dto.setEmployeeId(hod.getEmployeeId());
        dto.setFullName(hod.getFullName());
        dto.setDepartmentId(hod.getDepartment().getId());
        dto.setDepartmentName(hod.getDepartment().getName());
        dto.setDepartmentCode(hod.getDepartment().getCode());
        dto.setDesignation(hod.getDesignation());
        dto.setQualification(hod.getQualification());
        dto.setJoiningYear(hod.getJoiningYear());
        dto.setStartDate(hod.getStartDate());
        dto.setEndDate(hod.getEndDate());
        dto.setIsActive(hod.getIsActive());
        dto.setDob(hod.getDob());
        dto.setGender(hod.getGender());
        dto.setMobileNumber(hod.getMobileNumber());
        dto.setAddress(hod.getAddress());
        dto.setCreatedAt(hod.getCreatedAt());
        return dto;
    }

    @Transactional
    public HodProfileDto updateHodProfile(Long userId, UpdateHodProfileRequest request) {
        HodProfile hod = hodProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));

        if (request.getMobileNumber() != null) {
            hod.setMobileNumber(request.getMobileNumber());
        }
        if (request.getAddress() != null) {
            hod.setAddress(request.getAddress());
        }
        if (request.getQualification() != null) {
            hod.setQualification(request.getQualification());
        }
        if (request.getDob() != null) {
            hod.setDob(request.getDob());
        }
        if (request.getGender() != null) {
            hod.setGender(request.getGender());
        }

        hodProfileRepository.save(hod);
        return getHodProfile(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. HOD Department Performance Analytics (Batch 5E)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HodPerformanceOverviewDto getDepartmentPerformance(Long userId, Role userRole, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<Subject> subjects = subjectRepository.findByDepartmentId(dept.getId());
        List<Section> sections = sectionRepository.findByDepartmentId(dept.getId());
        List<StudentProfile> students = studentProfileRepository.findByDepartmentId(dept.getId());
        List<SubjectAcademicRecord> allRecords = subjectAcademicRecordRepository.findBySubjectDepartmentId(dept.getId());

        HodPerformanceOverviewDto dto = new HodPerformanceOverviewDto();
        dto.setDepartmentId(dept.getId());
        dto.setDepartmentName(dept.getName());
        dto.setDepartmentCode(dept.getCode());
        dto.setTotalStudents(students.size());
        dto.setTotalSubjects(subjects.size());

        // Overall calculations
        BigDecimal sumIat1 = BigDecimal.ZERO;
        int countIat1 = 0;
        BigDecimal sumIat2 = BigDecimal.ZERO;
        int countIat2 = 0;
        BigDecimal sumAssignment = BigDecimal.ZERO;
        int countAssignment = 0;
        BigDecimal sumAttendance = BigDecimal.ZERO;
        int countAttendance = 0;

        for (SubjectAcademicRecord r : allRecords) {
            if (r.getIat1Score() != null) {
                sumIat1 = sumIat1.add(r.getIat1Score());
                countIat1++;
            }
            if (r.getIat2Score() != null) {
                sumIat2 = sumIat2.add(r.getIat2Score());
                countIat2++;
            }
            if (r.getAssignmentScore() != null) {
                sumAssignment = sumAssignment.add(r.getAssignmentScore());
                countAssignment++;
            }
            if (r.getAttendancePercentage() != null) {
                sumAttendance = sumAttendance.add(r.getAttendancePercentage());
                countAttendance++;
            }
        }

        if (countIat1 > 0) {
            dto.setOverallAverageIat1(sumIat1.divide(BigDecimal.valueOf(countIat1), 2, RoundingMode.HALF_UP));
        }
        if (countIat2 > 0) {
            dto.setOverallAverageIat2(sumIat2.divide(BigDecimal.valueOf(countIat2), 2, RoundingMode.HALF_UP));
        }
        if (countAssignment > 0) {
            dto.setOverallAverageAssignment(sumAssignment.divide(BigDecimal.valueOf(countAssignment), 2, RoundingMode.HALF_UP));
        }
        if (countAttendance > 0) {
            dto.setOverallAverageAttendance(sumAttendance.divide(BigDecimal.valueOf(countAttendance), 2, RoundingMode.HALF_UP));
        }

        // Subject performances
        List<HodSubjectPerformanceDto> subjectDtos = new ArrayList<>();
        for (Subject sub : subjects) {
            List<SubjectAcademicRecord> subRecords = allRecords.stream()
                    .filter(r -> r.getSubject() != null && r.getSubject().getId().equals(sub.getId()))
                    .collect(Collectors.toList());

            HodSubjectPerformanceDto sDto = new HodSubjectPerformanceDto();
            sDto.setSubjectId(sub.getId());
            sDto.setSubjectCode(sub.getCode());
            sDto.setSubjectName(sub.getName());
            sDto.setSemester(sub.getSemester());
            sDto.setTotalStudents(subRecords.size());

            BigDecimal sIat1 = BigDecimal.ZERO;
            int scIat1 = 0;
            BigDecimal sIat2 = BigDecimal.ZERO;
            int scIat2 = 0;
            BigDecimal sAss = BigDecimal.ZERO;
            int scAss = 0;
            BigDecimal sAtt = BigDecimal.ZERO;
            int scAtt = 0;
            int passedCount = 0;

            for (SubjectAcademicRecord sr : subRecords) {
                if (sr.getIat1Score() != null) {
                    sIat1 = sIat1.add(sr.getIat1Score());
                    scIat1++;
                }
                if (sr.getIat2Score() != null) {
                    sIat2 = sIat2.add(sr.getIat2Score());
                    scIat2++;
                }
                if (sr.getAssignmentScore() != null) {
                    sAss = sAss.add(sr.getAssignmentScore());
                    scAss++;
                }
                if (sr.getAttendancePercentage() != null) {
                    sAtt = sAtt.add(sr.getAttendancePercentage());
                    scAtt++;
                }
                // Determine passing (IAT1 or IAT2 >= 20/50, or attendance >= 75)
                boolean passed = true;
                if (sr.getIat1Score() != null && sr.getIat1Score().compareTo(BigDecimal.valueOf(20)) < 0) {
                    passed = false;
                }
                if (sr.getIat2Score() != null && sr.getIat2Score().compareTo(BigDecimal.valueOf(20)) < 0) {
                    passed = false;
                }
                if (passed) {
                    passedCount++;
                }
            }

            if (scIat1 > 0) sDto.setAverageIat1(sIat1.divide(BigDecimal.valueOf(scIat1), 2, RoundingMode.HALF_UP));
            if (scIat2 > 0) sDto.setAverageIat2(sIat2.divide(BigDecimal.valueOf(scIat2), 2, RoundingMode.HALF_UP));
            if (scAss > 0) sDto.setAverageAssignment(sAss.divide(BigDecimal.valueOf(scAss), 2, RoundingMode.HALF_UP));
            if (scAtt > 0) sDto.setAverageAttendance(sAtt.divide(BigDecimal.valueOf(scAtt), 2, RoundingMode.HALF_UP));
            if (!subRecords.isEmpty()) {
                sDto.setPassPercentage(BigDecimal.valueOf(passedCount * 100.0 / subRecords.size()).setScale(2, RoundingMode.HALF_UP));
            }
            subjectDtos.add(sDto);
        }
        dto.setSubjectPerformances(subjectDtos);

        // Section performances
        List<HodSectionPerformanceDto> sectionDtos = new ArrayList<>();
        for (Section sec : sections) {
            List<StudentProfile> secStudents = studentProfileRepository.findByDepartmentIdAndSectionId(dept.getId(), sec.getId());
            Set<Long> studentIds = secStudents.stream().map(StudentProfile::getId).collect(Collectors.toSet());
            List<SubjectAcademicRecord> secRecords = allRecords.stream()
                    .filter(r -> r.getStudent() != null && studentIds.contains(r.getStudent().getId()))
                    .collect(Collectors.toList());

            HodSectionPerformanceDto secDto = new HodSectionPerformanceDto();
            secDto.setSectionId(sec.getId());
            secDto.setSectionName(sec.getName());
            secDto.setStudentCount(secStudents.size());

            BigDecimal secIat1 = BigDecimal.ZERO;
            int secCIat1 = 0;
            BigDecimal secIat2 = BigDecimal.ZERO;
            int secCIat2 = 0;
            BigDecimal secAtt = BigDecimal.ZERO;
            int secCAtt = 0;

            for (SubjectAcademicRecord sr : secRecords) {
                if (sr.getIat1Score() != null) {
                    secIat1 = secIat1.add(sr.getIat1Score());
                    secCIat1++;
                }
                if (sr.getIat2Score() != null) {
                    secIat2 = secIat2.add(sr.getIat2Score());
                    secCIat2++;
                }
                if (sr.getAttendancePercentage() != null) {
                    secAtt = secAtt.add(sr.getAttendancePercentage());
                    secCAtt++;
                }
            }

            if (secCIat1 > 0) secDto.setAverageIat1(secIat1.divide(BigDecimal.valueOf(secCIat1), 2, RoundingMode.HALF_UP));
            if (secCIat2 > 0) secDto.setAverageIat2(secIat2.divide(BigDecimal.valueOf(secCIat2), 2, RoundingMode.HALF_UP));
            if (secCAtt > 0) secDto.setAverageAttendance(secAtt.divide(BigDecimal.valueOf(secCAtt), 2, RoundingMode.HALF_UP));
            sectionDtos.add(secDto);
        }
        dto.setSectionPerformances(sectionDtos);

        // Defaulters list (Attendance < 75% or IAT1 < 20 or IAT2 < 20)
        List<HodAcademicDefaulterDto> defaulterDtos = new ArrayList<>();
        for (SubjectAcademicRecord sr : allRecords) {
            boolean isDefaulter = false;
            if (sr.getAttendancePercentage() != null && sr.getAttendancePercentage().compareTo(BigDecimal.valueOf(75)) < 0) {
                isDefaulter = true;
            }
            if (sr.getIat1Score() != null && sr.getIat1Score().compareTo(BigDecimal.valueOf(20)) < 0) {
                isDefaulter = true;
            }
            if (sr.getIat2Score() != null && sr.getIat2Score().compareTo(BigDecimal.valueOf(20)) < 0) {
                isDefaulter = true;
            }

            if (isDefaulter && sr.getStudent() != null) {
                HodAcademicDefaulterDto d = new HodAcademicDefaulterDto();
                d.setStudentProfileId(sr.getStudent().getId());
                d.setRegisterNumber(sr.getStudent().getRegisterNumber());
                d.setStudentName(sr.getStudent().getFullName());
                d.setSectionName(sr.getStudent().getSection() != null ? sr.getStudent().getSection().getName() : "N/A");
                d.setSubjectCode(sr.getSubject() != null ? sr.getSubject().getCode() : "N/A");
                d.setSubjectName(sr.getSubject() != null ? sr.getSubject().getName() : "N/A");
                d.setIat1Score(sr.getIat1Score());
                d.setIat2Score(sr.getIat2Score());
                d.setAttendancePercentage(sr.getAttendancePercentage());
                defaulterDtos.add(d);
            }
        }
        dto.setDefaulters(defaulterDtos);
        dto.setTotalDefaultersCount(defaulterDtos.size());

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. HOD Department Reports Summary (Batch 5F)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HodReportsSummaryDto getDepartmentReports(Long userId, Role userRole, Long targetDeptId) {
        Department dept = resolveDepartment(userId, userRole, targetDeptId);

        List<Subject> subjects = subjectRepository.findByDepartmentId(dept.getId());
        List<Section> sections = sectionRepository.findByDepartmentId(dept.getId());
        List<StaffProfile> faculty = staffProfileRepository.findByDepartmentId(dept.getId());
        List<StudentProfile> students = studentProfileRepository.findByDepartmentId(dept.getId());
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findBySubjectDepartmentId(dept.getId());
        List<SubjectAcademicRecord> records = subjectAcademicRecordRepository.findBySubjectDepartmentId(dept.getId());

        HodReportsSummaryDto dto = new HodReportsSummaryDto();
        dto.setDepartmentId(dept.getId());
        dto.setDepartmentName(dept.getName());
        dto.setDepartmentCode(dept.getCode());
        dto.setGeneratedAt(LocalDateTime.now());
        dto.setTotalStudents(students.size());
        dto.setTotalFaculty(faculty.size());
        dto.setTotalSections(sections.size());
        dto.setTotalSubjects(subjects.size());

        // Attendance & IAT calculations
        BigDecimal totalAtt = BigDecimal.ZERO;
        int attCount = 0;
        int defaulterCount = 0;
        BigDecimal totalIat1 = BigDecimal.ZERO;
        int iat1Count = 0;
        BigDecimal totalIat2 = BigDecimal.ZERO;
        int iat2Count = 0;

        for (SubjectAcademicRecord r : records) {
            if (r.getAttendancePercentage() != null) {
                totalAtt = totalAtt.add(r.getAttendancePercentage());
                attCount++;
                if (r.getAttendancePercentage().compareTo(BigDecimal.valueOf(75)) < 0) {
                    defaulterCount++;
                }
            }
            if (r.getIat1Score() != null) {
                totalIat1 = totalIat1.add(r.getIat1Score());
                iat1Count++;
            }
            if (r.getIat2Score() != null) {
                totalIat2 = totalIat2.add(r.getIat2Score());
                iat2Count++;
            }
        }

        if (attCount > 0) {
            dto.setAverageAttendance(totalAtt.divide(BigDecimal.valueOf(attCount), 2, RoundingMode.HALF_UP));
        } else {
            dto.setAverageAttendance(BigDecimal.ZERO);
        }
        dto.setAttendanceDefaultersCount(defaulterCount);

        if (iat1Count > 0) {
            dto.setAverageIat1(totalIat1.divide(BigDecimal.valueOf(iat1Count), 2, RoundingMode.HALF_UP));
        } else {
            dto.setAverageIat1(BigDecimal.ZERO);
        }

        if (iat2Count > 0) {
            dto.setAverageIat2(totalIat2.divide(BigDecimal.valueOf(iat2Count), 2, RoundingMode.HALF_UP));
        } else {
            dto.setAverageIat2(BigDecimal.ZERO);
        }

        // Assignments and submissions
        int totalAssignmentCount = 0;
        int totalSubmissionCount = 0;
        for (TeachingAssignment ta : assignments) {
            List<Assignment> taAssignments = assignmentRepository.findByTeachingAssignmentIdOrderByDeadlineAsc(ta.getId());
            totalAssignmentCount += taAssignments.size();
            for (Assignment a : taAssignments) {
                totalSubmissionCount += assignmentSubmissionRepository.findByAssignmentId(a.getId()).size();
            }
        }
        dto.setTotalAssignments(totalAssignmentCount);
        dto.setTotalSubmissions(totalSubmissionCount);

        // Achievements
        List<Achievement> verifiedAchievements = achievementRepository.findByStudentDepartmentIdAndStatusOrderByAchievementDateDesc(
                dept.getId(), AchievementStatus.VERIFIED);
        dto.setVerifiedAchievementsCount(verifiedAchievements.size());

        // Faculty workloads
        List<FacultyWorkloadReportDto> workloadDtos = new ArrayList<>();
        for (StaffProfile sp : faculty) {
            List<TeachingAssignment> staffTas = teachingAssignmentRepository.findByStaffId(sp.getId());
            int enrolled = 0;
            for (TeachingAssignment ta : staffTas) {
                if (ta.getSection() != null) {
                    enrolled += studentProfileRepository.findByDepartmentIdAndSectionId(
                            dept.getId(), ta.getSection().getId()).size();
                }
            }
            FacultyWorkloadReportDto wDto = new FacultyWorkloadReportDto();
            wDto.setStaffProfileId(sp.getId());
            wDto.setEmployeeId(sp.getEmployeeId());
            wDto.setFullName(sp.getFullName());
            wDto.setDesignation(sp.getDesignation());
            wDto.setAssignedClassesCount(staffTas.size());
            wDto.setTotalStudents(enrolled);
            workloadDtos.add(wDto);
        }
        dto.setFacultyWorkloads(workloadDtos);

        // Subject Performances (reusing getDepartmentPerformance logic)
        HodPerformanceOverviewDto perf = getDepartmentPerformance(userId, userRole, targetDeptId);
        dto.setSubjectPerformances(perf.getSubjectPerformances());

        return dto;
    }
}
