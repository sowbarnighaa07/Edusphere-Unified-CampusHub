package com.edusphere.dto.admin;

import java.util.List;
import java.util.Map;

public class AdminReportsDto {

    private List<DepartmentDistributionItemDto> studentDistributionByDepartment;
    private List<DepartmentDistributionItemDto> facultyDistributionByDepartment;
    private List<SectionDistributionItemDto> sectionEnrollmentBreakdown;
    private List<DepartmentAttendanceReportDto> departmentAttendanceComparison;
    private Map<String, Long> userStatusBreakdown;
    private Map<String, Long> leaveStatusBreakdown;

    public AdminReportsDto() {}

    public List<DepartmentDistributionItemDto> getStudentDistributionByDepartment() { return studentDistributionByDepartment; }
    public void setStudentDistributionByDepartment(List<DepartmentDistributionItemDto> studentDistributionByDepartment) { this.studentDistributionByDepartment = studentDistributionByDepartment; }

    public List<DepartmentDistributionItemDto> getFacultyDistributionByDepartment() { return facultyDistributionByDepartment; }
    public void setFacultyDistributionByDepartment(List<DepartmentDistributionItemDto> facultyDistributionByDepartment) { this.facultyDistributionByDepartment = facultyDistributionByDepartment; }

    public List<SectionDistributionItemDto> getSectionEnrollmentBreakdown() { return sectionEnrollmentBreakdown; }
    public void setSectionEnrollmentBreakdown(List<SectionDistributionItemDto> sectionEnrollmentBreakdown) { this.sectionEnrollmentBreakdown = sectionEnrollmentBreakdown; }

    public List<DepartmentAttendanceReportDto> getDepartmentAttendanceComparison() { return departmentAttendanceComparison; }
    public void setDepartmentAttendanceComparison(List<DepartmentAttendanceReportDto> departmentAttendanceComparison) { this.departmentAttendanceComparison = departmentAttendanceComparison; }

    public Map<String, Long> getUserStatusBreakdown() { return userStatusBreakdown; }
    public void setUserStatusBreakdown(Map<String, Long> userStatusBreakdown) { this.userStatusBreakdown = userStatusBreakdown; }

    public Map<String, Long> getLeaveStatusBreakdown() { return leaveStatusBreakdown; }
    public void setLeaveStatusBreakdown(Map<String, Long> leaveStatusBreakdown) { this.leaveStatusBreakdown = leaveStatusBreakdown; }

    public static class DepartmentDistributionItemDto {
        private String departmentCode;
        private String departmentName;
        private long count;
        private double percentage;

        public DepartmentDistributionItemDto() {}

        public DepartmentDistributionItemDto(String departmentCode, String departmentName, long count, double percentage) {
            this.departmentCode = departmentCode;
            this.departmentName = departmentName;
            this.count = count;
            this.percentage = percentage;
        }

        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class SectionDistributionItemDto {
        private String departmentCode;
        private String sectionName;
        private long studentCount;

        public SectionDistributionItemDto() {}

        public SectionDistributionItemDto(String departmentCode, String sectionName, long studentCount) {
            this.departmentCode = departmentCode;
            this.sectionName = sectionName;
            this.studentCount = studentCount;
        }

        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }

        public long getStudentCount() { return studentCount; }
        public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    }

    public static class DepartmentAttendanceReportDto {
        private String departmentCode;
        private String departmentName;
        private Double averageAttendance;
        private int totalRecords;
        private int defaultersCount;

        public DepartmentAttendanceReportDto() {}

        public DepartmentAttendanceReportDto(String departmentCode, String departmentName, Double averageAttendance, int totalRecords, int defaultersCount) {
            this.departmentCode = departmentCode;
            this.departmentName = departmentName;
            this.averageAttendance = averageAttendance;
            this.totalRecords = totalRecords;
            this.defaultersCount = defaultersCount;
        }

        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

        public int getTotalRecords() { return totalRecords; }
        public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

        public int getDefaultersCount() { return defaultersCount; }
        public void setDefaultersCount(int defaultersCount) { this.defaultersCount = defaultersCount; }
    }
}
