package com.edusphere.service;

import com.edusphere.dto.admin.*;
import com.edusphere.dto.common.PagedResponse;
import com.edusphere.entity.*;
import com.edusphere.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminMonitoringService {

    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminMonitoringService(StudentProfileRepository studentProfileRepository,
                                  StaffProfileRepository staffProfileRepository,
                                  HodProfileRepository hodProfileRepository,
                                  DepartmentRepository departmentRepository,
                                  SectionRepository sectionRepository,
                                  SubjectRepository subjectRepository,
                                  ClassroomRepository classroomRepository,
                                  UserRepository userRepository,
                                  LeaveRequestRepository leaveRequestRepository,
                                  SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                                  AuditLogRepository auditLogRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Live Campus Monitoring Summary
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AdminMonitoringDto getCampusMonitoring() {
        AdminMonitoringDto monitoring = new AdminMonitoringDto();

        // 1. Campus Overview Counts
        AdminMonitoringDto.CampusOverviewDto overview = new AdminMonitoringDto.CampusOverviewDto();
        overview.setTotalStudents(studentProfileRepository.count());
        overview.setTotalActiveFaculty(staffProfileRepository.count());
        overview.setTotalHods(hodProfileRepository.count());
        overview.setTotalDepartments(departmentRepository.count());
        overview.setTotalSections(sectionRepository.count());
        overview.setTotalSubjects(subjectRepository.count());
        overview.setTotalClassrooms(classroomRepository.count());
        overview.setPendingRegistrations(userRepository.countByStatus(UserStatus.PENDING));

        long pendingStaffLeaves = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING_STAFF).size();
        long pendingHodLeaves = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING_HOD).size();
        overview.setPendingLeaveRequests(pendingStaffLeaves + pendingHodLeaves);

        // 2. Department-Wise Summaries
        List<Department> departments = departmentRepository.findAll();
        List<AdminMonitoringDto.DepartmentMonitoringSummaryDto> deptSummaries = new ArrayList<>();
        List<AdminMonitoringDto.InstitutionAttendanceOverviewDto.DeptAttendanceStatDto> deptAttendanceList = new ArrayList<>();

        List<SubjectAcademicRecord> allRecords = subjectAcademicRecordRepository.findAll();
        List<SubjectAcademicRecord> validAttendanceRecords = allRecords.stream()
                .filter(r -> r.getAttendancePercentage() != null)
                .toList();

        double totalInstitutionAttendanceSum = 0;
        int totalInstitutionAttendanceRecords = 0;
        int totalInstitutionDefaulters = 0;

        for (Department dept : departments) {
            AdminMonitoringDto.DepartmentMonitoringSummaryDto dDto = new AdminMonitoringDto.DepartmentMonitoringSummaryDto();
            dDto.setDepartmentId(dept.getId());
            dDto.setDepartmentCode(dept.getCode());
            dDto.setDepartmentName(dept.getName());
            dDto.setStudentCount(studentProfileRepository.countByDepartmentId(dept.getId()));
            dDto.setFacultyCount(staffProfileRepository.countByDepartmentId(dept.getId()));
            dDto.setSectionCount(sectionRepository.findByDepartmentId(dept.getId()).size());
            dDto.setSubjectCount(subjectRepository.findByDepartmentId(dept.getId()).size());

            long deptPendingLeaves = leaveRequestRepository.countByStudentDepartmentIdAndStatus(dept.getId(), LeaveStatus.PENDING_STAFF)
                    + leaveRequestRepository.countByStudentDepartmentIdAndStatus(dept.getId(), LeaveStatus.PENDING_HOD);
            dDto.setPendingLeavesCount(deptPendingLeaves);

            // Filter attendance records for this department's students
            List<SubjectAcademicRecord> deptRecords = validAttendanceRecords.stream()
                    .filter(r -> r.getStudent() != null && r.getStudent().getDepartment() != null
                            && Objects.equals(r.getStudent().getDepartment().getId(), dept.getId()))
                    .toList();

            if (!deptRecords.isEmpty()) {
                double deptSum = deptRecords.stream().mapToDouble(r -> r.getAttendancePercentage().doubleValue()).sum();
                int defaulters = (int) deptRecords.stream().filter(r -> r.getAttendancePercentage().doubleValue() < 75.0).count();
                double deptAvg = BigDecimal.valueOf(deptSum / deptRecords.size()).setScale(2, RoundingMode.HALF_UP).doubleValue();

                dDto.setAverageAttendance(deptAvg);
                dDto.setDefaultersCount(defaulters);

                AdminMonitoringDto.InstitutionAttendanceOverviewDto.DeptAttendanceStatDto dStat = new AdminMonitoringDto.InstitutionAttendanceOverviewDto.DeptAttendanceStatDto();
                dStat.setDepartmentCode(dept.getCode());
                dStat.setDepartmentName(dept.getName());
                dStat.setAverageAttendance(deptAvg);
                dStat.setRecordsCount(deptRecords.size());
                dStat.setDefaultersCount(defaulters);
                deptAttendanceList.add(dStat);

                totalInstitutionAttendanceSum += deptSum;
                totalInstitutionAttendanceRecords += deptRecords.size();
                totalInstitutionDefaulters += defaulters;
            } else {
                dDto.setAverageAttendance(null);
                dDto.setDefaultersCount(0);

                AdminMonitoringDto.InstitutionAttendanceOverviewDto.DeptAttendanceStatDto dStat = new AdminMonitoringDto.InstitutionAttendanceOverviewDto.DeptAttendanceStatDto();
                dStat.setDepartmentCode(dept.getCode());
                dStat.setDepartmentName(dept.getName());
                dStat.setAverageAttendance(null);
                dStat.setRecordsCount(0);
                dStat.setDefaultersCount(0);
                deptAttendanceList.add(dStat);
            }

            deptSummaries.add(dDto);
        }

        Double institutionAvgAttendance = totalInstitutionAttendanceRecords > 0
                ? BigDecimal.valueOf(totalInstitutionAttendanceSum / totalInstitutionAttendanceRecords).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : null;
        overview.setInstitutionAverageAttendance(institutionAvgAttendance);
        monitoring.setCampusOverview(overview);
        monitoring.setDepartmentSummaries(deptSummaries);

        // 3. Attendance Overview
        AdminMonitoringDto.InstitutionAttendanceOverviewDto attOverview = new AdminMonitoringDto.InstitutionAttendanceOverviewDto();
        attOverview.setOverallAverageAttendance(institutionAvgAttendance);
        attOverview.setTotalAttendanceRecords(totalInstitutionAttendanceRecords);
        attOverview.setTotalDefaulters(totalInstitutionDefaulters);
        attOverview.setDepartmentAverages(deptAttendanceList);
        monitoring.setAttendanceOverview(attOverview);

        // 4. Academic Performance Overview
        AdminMonitoringDto.InstitutionAcademicPerformanceOverviewDto perfOverview = new AdminMonitoringDto.InstitutionAcademicPerformanceOverviewDto();
        List<SubjectAcademicRecord> iat1Records = allRecords.stream().filter(r -> r.getIat1Score() != null).toList();
        List<SubjectAcademicRecord> iat2Records = allRecords.stream().filter(r -> r.getIat2Score() != null).toList();

        if (!iat1Records.isEmpty() || !iat2Records.isEmpty()) {
            perfOverview.setHasPerformanceData(true);
            perfOverview.setTotalEvaluatedRecords(iat1Records.size() + iat2Records.size());
            if (!iat1Records.isEmpty()) {
                double avg1 = iat1Records.stream().mapToDouble(r -> r.getIat1Score().doubleValue()).average().orElse(0.0);
                perfOverview.setAverageIat1Score(BigDecimal.valueOf(avg1).setScale(2, RoundingMode.HALF_UP).doubleValue());
            }
            if (!iat2Records.isEmpty()) {
                double avg2 = iat2Records.stream().mapToDouble(r -> r.getIat2Score().doubleValue()).average().orElse(0.0);
                perfOverview.setAverageIat2Score(BigDecimal.valueOf(avg2).setScale(2, RoundingMode.HALF_UP).doubleValue());
            }
            perfOverview.setStatusMessage("Continuous internal assessment evaluations recorded in database.");
        } else {
            perfOverview.setHasPerformanceData(false);
            perfOverview.setTotalEvaluatedRecords(0);
            perfOverview.setStatusMessage("No academic assessment marks evaluated yet.");
        }
        monitoring.setPerformanceOverview(perfOverview);

        // 5. System Queues
        AdminMonitoringDto.SystemQueueOverviewDto queueOverview = new AdminMonitoringDto.SystemQueueOverviewDto();
        queueOverview.setPendingRegistrationsCount(overview.getPendingRegistrations());
        queueOverview.setPendingLeavesCount(overview.getPendingLeaveRequests());
        monitoring.setQueueOverview(queueOverview);

        return monitoring;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Report-Ready Institution Data
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AdminReportsDto getCampusReports() {
        AdminReportsDto reports = new AdminReportsDto();

        List<Department> departments = departmentRepository.findAll();
        long totalStudents = studentProfileRepository.count();
        long totalFaculty = staffProfileRepository.count();

        // 1. Student Distribution
        List<AdminReportsDto.DepartmentDistributionItemDto> studentDist = new ArrayList<>();
        for (Department dept : departments) {
            long count = studentProfileRepository.countByDepartmentId(dept.getId());
            double pct = totalStudents > 0
                    ? BigDecimal.valueOf((count * 100.0) / totalStudents).setScale(2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            studentDist.add(new AdminReportsDto.DepartmentDistributionItemDto(dept.getCode(), dept.getName(), count, pct));
        }
        reports.setStudentDistributionByDepartment(studentDist);

        // 2. Faculty Distribution
        List<AdminReportsDto.DepartmentDistributionItemDto> facultyDist = new ArrayList<>();
        for (Department dept : departments) {
            long count = staffProfileRepository.countByDepartmentId(dept.getId());
            double pct = totalFaculty > 0
                    ? BigDecimal.valueOf((count * 100.0) / totalFaculty).setScale(2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            facultyDist.add(new AdminReportsDto.DepartmentDistributionItemDto(dept.getCode(), dept.getName(), count, pct));
        }
        reports.setFacultyDistributionByDepartment(facultyDist);

        // 3. Section Enrollment Breakdown
        List<AdminReportsDto.SectionDistributionItemDto> sectionBreakdown = new ArrayList<>();
        List<Section> allSections = sectionRepository.findAll();
        for (Section sec : allSections) {
            long count = studentProfileRepository.findByDepartmentIdAndSectionId(sec.getDepartment().getId(), sec.getId()).size();
            sectionBreakdown.add(new AdminReportsDto.SectionDistributionItemDto(sec.getDepartment().getCode(), sec.getName(), count));
        }
        reports.setSectionEnrollmentBreakdown(sectionBreakdown);

        // 4. Department Attendance Comparison
        List<AdminReportsDto.DepartmentAttendanceReportDto> attReports = new ArrayList<>();
        List<SubjectAcademicRecord> validAttendanceRecords = subjectAcademicRecordRepository.findAll().stream()
                .filter(r -> r.getAttendancePercentage() != null)
                .toList();

        for (Department dept : departments) {
            List<SubjectAcademicRecord> deptRecords = validAttendanceRecords.stream()
                    .filter(r -> r.getStudent() != null && r.getStudent().getDepartment() != null
                            && Objects.equals(r.getStudent().getDepartment().getId(), dept.getId()))
                    .toList();

            if (!deptRecords.isEmpty()) {
                double avg = deptRecords.stream().mapToDouble(r -> r.getAttendancePercentage().doubleValue()).average().orElse(0.0);
                int defs = (int) deptRecords.stream().filter(r -> r.getAttendancePercentage().doubleValue() < 75.0).count();
                attReports.add(new AdminReportsDto.DepartmentAttendanceReportDto(
                        dept.getCode(), dept.getName(),
                        BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue(),
                        deptRecords.size(), defs));
            } else {
                attReports.add(new AdminReportsDto.DepartmentAttendanceReportDto(
                        dept.getCode(), dept.getName(), null, 0, 0));
            }
        }
        reports.setDepartmentAttendanceComparison(attReports);

        // 5. User Status Breakdown
        Map<String, Long> userStatusMap = new LinkedHashMap<>();
        for (UserStatus st : UserStatus.values()) {
            userStatusMap.put(st.name(), userRepository.countByStatus(st));
        }
        reports.setUserStatusBreakdown(userStatusMap);

        // 6. Leave Status Breakdown
        Map<String, Long> leaveStatusMap = new LinkedHashMap<>();
        for (LeaveStatus ls : LeaveStatus.values()) {
            leaveStatusMap.put(ls.name(), (long) leaveRequestRepository.findByStatusOrderByCreatedAtDesc(ls).size());
        }
        reports.setLeaveStatusBreakdown(leaveStatusMap);

        return reports;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Filtered Audit Logs with Pagination
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> getFilteredAuditLogs(
            Role role, String action, String ipAddress, LocalDate fromDate, LocalDate toDate, int page, int size) {

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (role != null) {
                predicates.add(cb.equal(root.get("user").get("role"), role));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.trim().toUpperCase()));
            }
            if (ipAddress != null && !ipAddress.isBlank()) {
                predicates.add(cb.like(root.get("ipAddress"), "%" + ipAddress.trim() + "%"));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> auditPage = auditLogRepository.findAll(spec, pageRequest);

        List<AuditLogDto> content = auditPage.getContent().stream()
                .map(this::toAuditLogDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                auditPage.getNumber(),
                auditPage.getSize(),
                auditPage.getTotalElements(),
                auditPage.getTotalPages(),
                auditPage.isLast());
    }

    private AuditLogDto toAuditLogDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getId());
            dto.setUserRole(log.getUser().getRole() != null ? log.getUser().getRole().name() : "N/A");
        } else {
            dto.setUserRole("SYSTEM");
        }
        dto.setUserEmail(log.getUserEmail());
        dto.setAction(log.getAction());
        dto.setTargetResource(log.getTargetResource());
        dto.setTargetId(log.getTargetId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
