package com.edusphere.dto.admin;

import java.util.List;

public class AdminMonitoringDto {

    private CampusOverviewDto campusOverview;
    private List<DepartmentMonitoringSummaryDto> departmentSummaries;
    private InstitutionAttendanceOverviewDto attendanceOverview;
    private InstitutionAcademicPerformanceOverviewDto performanceOverview;
    private SystemQueueOverviewDto queueOverview;

    public AdminMonitoringDto() {}

    public CampusOverviewDto getCampusOverview() { return campusOverview; }
    public void setCampusOverview(CampusOverviewDto campusOverview) { this.campusOverview = campusOverview; }

    public List<DepartmentMonitoringSummaryDto> getDepartmentSummaries() { return departmentSummaries; }
    public void setDepartmentSummaries(List<DepartmentMonitoringSummaryDto> departmentSummaries) { this.departmentSummaries = departmentSummaries; }

    public InstitutionAttendanceOverviewDto getAttendanceOverview() { return attendanceOverview; }
    public void setAttendanceOverview(InstitutionAttendanceOverviewDto attendanceOverview) { this.attendanceOverview = attendanceOverview; }

    public InstitutionAcademicPerformanceOverviewDto getPerformanceOverview() { return performanceOverview; }
    public void setPerformanceOverview(InstitutionAcademicPerformanceOverviewDto performanceOverview) { this.performanceOverview = performanceOverview; }

    public SystemQueueOverviewDto getQueueOverview() { return queueOverview; }
    public void setQueueOverview(SystemQueueOverviewDto queueOverview) { this.queueOverview = queueOverview; }

    // ─────────────────────────────────────────────────────────────────────────
    // Sub-DTOs
    // ─────────────────────────────────────────────────────────────────────────

    public static class CampusOverviewDto {
        private long totalStudents;
        private long totalActiveFaculty;
        private long totalHods;
        private long totalDepartments;
        private long totalSections;
        private long totalSubjects;
        private long totalClassrooms;
        private long pendingRegistrations;
        private long pendingLeaveRequests;
        private Double institutionAverageAttendance;

        public CampusOverviewDto() {}

        public long getTotalStudents() { return totalStudents; }
        public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

        public long getTotalActiveFaculty() { return totalActiveFaculty; }
        public void setTotalActiveFaculty(long totalActiveFaculty) { this.totalActiveFaculty = totalActiveFaculty; }

        public long getTotalHods() { return totalHods; }
        public void setTotalHods(long totalHods) { this.totalHods = totalHods; }

        public long getTotalDepartments() { return totalDepartments; }
        public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

        public long getTotalSections() { return totalSections; }
        public void setTotalSections(long totalSections) { this.totalSections = totalSections; }

        public long getTotalSubjects() { return totalSubjects; }
        public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

        public long getTotalClassrooms() { return totalClassrooms; }
        public void setTotalClassrooms(long totalClassrooms) { this.totalClassrooms = totalClassrooms; }

        public long getPendingRegistrations() { return pendingRegistrations; }
        public void setPendingRegistrations(long pendingRegistrations) { this.pendingRegistrations = pendingRegistrations; }

        public long getPendingLeaveRequests() { return pendingLeaveRequests; }
        public void setPendingLeaveRequests(long pendingLeaveRequests) { this.pendingLeaveRequests = pendingLeaveRequests; }

        public Double getInstitutionAverageAttendance() { return institutionAverageAttendance; }
        public void setInstitutionAverageAttendance(Double institutionAverageAttendance) { this.institutionAverageAttendance = institutionAverageAttendance; }
    }

    public static class DepartmentMonitoringSummaryDto {
        private Long departmentId;
        private String departmentCode;
        private String departmentName;
        private long studentCount;
        private long facultyCount;
        private long sectionCount;
        private long subjectCount;
        private Double averageAttendance;
        private int defaultersCount;
        private long pendingLeavesCount;

        public DepartmentMonitoringSummaryDto() {}

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

        public long getStudentCount() { return studentCount; }
        public void setStudentCount(long studentCount) { this.studentCount = studentCount; }

        public long getFacultyCount() { return facultyCount; }
        public void setFacultyCount(long facultyCount) { this.facultyCount = facultyCount; }

        public long getSectionCount() { return sectionCount; }
        public void setSectionCount(long sectionCount) { this.sectionCount = sectionCount; }

        public long getSubjectCount() { return subjectCount; }
        public void setSubjectCount(long subjectCount) { this.subjectCount = subjectCount; }

        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

        public int getDefaultersCount() { return defaultersCount; }
        public void setDefaultersCount(int defaultersCount) { this.defaultersCount = defaultersCount; }

        public long getPendingLeavesCount() { return pendingLeavesCount; }
        public void setPendingLeavesCount(long pendingLeavesCount) { this.pendingLeavesCount = pendingLeavesCount; }
    }

    public static class InstitutionAttendanceOverviewDto {
        private Double overallAverageAttendance;
        private int totalAttendanceRecords;
        private int totalDefaulters;
        private double attendanceThreshold = 75.0;
        private List<DeptAttendanceStatDto> departmentAverages;

        public InstitutionAttendanceOverviewDto() {}

        public Double getOverallAverageAttendance() { return overallAverageAttendance; }
        public void setOverallAverageAttendance(Double overallAverageAttendance) { this.overallAverageAttendance = overallAverageAttendance; }

        public int getTotalAttendanceRecords() { return totalAttendanceRecords; }
        public void setTotalAttendanceRecords(int totalAttendanceRecords) { this.totalAttendanceRecords = totalAttendanceRecords; }

        public int getTotalDefaulters() { return totalDefaulters; }
        public void setTotalDefaulters(int totalDefaulters) { this.totalDefaulters = totalDefaulters; }

        public double getAttendanceThreshold() { return attendanceThreshold; }
        public void setAttendanceThreshold(double attendanceThreshold) { this.attendanceThreshold = attendanceThreshold; }

        public List<DeptAttendanceStatDto> getDepartmentAverages() { return departmentAverages; }
        public void setDepartmentAverages(List<DeptAttendanceStatDto> departmentAverages) { this.departmentAverages = departmentAverages; }

        public static class DeptAttendanceStatDto {
            private String departmentCode;
            private String departmentName;
            private Double averageAttendance;
            private int recordsCount;
            private int defaultersCount;

            public DeptAttendanceStatDto() {}

            public String getDepartmentCode() { return departmentCode; }
            public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

            public String getDepartmentName() { return departmentName; }
            public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

            public Double getAverageAttendance() { return averageAttendance; }
            public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

            public int getRecordsCount() { return recordsCount; }
            public void setRecordsCount(int recordsCount) { this.recordsCount = recordsCount; }

            public int getDefaultersCount() { return defaultersCount; }
            public void setDefaultersCount(int defaultersCount) { this.defaultersCount = defaultersCount; }
        }
    }

    public static class InstitutionAcademicPerformanceOverviewDto {
        private boolean hasPerformanceData;
        private String statusMessage;
        private int totalEvaluatedRecords;
        private Double averageIat1Score;
        private Double averageIat2Score;

        public InstitutionAcademicPerformanceOverviewDto() {}

        public boolean isHasPerformanceData() { return hasPerformanceData; }
        public void setHasPerformanceData(boolean hasPerformanceData) { this.hasPerformanceData = hasPerformanceData; }

        public String getStatusMessage() { return statusMessage; }
        public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

        public int getTotalEvaluatedRecords() { return totalEvaluatedRecords; }
        public void setTotalEvaluatedRecords(int totalEvaluatedRecords) { this.totalEvaluatedRecords = totalEvaluatedRecords; }

        public Double getAverageIat1Score() { return averageIat1Score; }
        public void setAverageIat1Score(Double averageIat1Score) { this.averageIat1Score = averageIat1Score; }

        public Double getAverageIat2Score() { return averageIat2Score; }
        public void setAverageIat2Score(Double averageIat2Score) { this.averageIat2Score = averageIat2Score; }
    }

    public static class SystemQueueOverviewDto {
        private long pendingRegistrationsCount;
        private long pendingLeavesCount;

        public SystemQueueOverviewDto() {}

        public long getPendingRegistrationsCount() { return pendingRegistrationsCount; }
        public void setPendingRegistrationsCount(long pendingRegistrationsCount) { this.pendingRegistrationsCount = pendingRegistrationsCount; }

        public long getPendingLeavesCount() { return pendingLeavesCount; }
        public void setPendingLeavesCount(long pendingLeavesCount) { this.pendingLeavesCount = pendingLeavesCount; }
    }
}
