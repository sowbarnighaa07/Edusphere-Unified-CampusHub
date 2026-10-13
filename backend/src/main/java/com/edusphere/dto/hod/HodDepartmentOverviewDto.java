package com.edusphere.dto.hod;

import java.util.List;

/**
 * Department summary returned to HOD dashboard — real counts only, no mock data.
 */
public class HodDepartmentOverviewDto {

    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private String hodName;
    private String hodDesignation;
    private String hodEmployeeId;

    // Aggregate counts
    private long totalStudents;
    private long totalFaculty;
    private long totalSubjects;
    private long totalSections;
    private long pendingLeaveRequests;
    private long activeSemesters;

    // Section-level breakdown
    private List<SectionSummaryDto> sections;

    public HodDepartmentOverviewDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getHodName() { return hodName; }
    public void setHodName(String hodName) { this.hodName = hodName; }

    public String getHodDesignation() { return hodDesignation; }
    public void setHodDesignation(String hodDesignation) { this.hodDesignation = hodDesignation; }

    public String getHodEmployeeId() { return hodEmployeeId; }
    public void setHodEmployeeId(String hodEmployeeId) { this.hodEmployeeId = hodEmployeeId; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public long getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

    public long getTotalSections() { return totalSections; }
    public void setTotalSections(long totalSections) { this.totalSections = totalSections; }

    public long getPendingLeaveRequests() { return pendingLeaveRequests; }
    public void setPendingLeaveRequests(long pendingLeaveRequests) { this.pendingLeaveRequests = pendingLeaveRequests; }

    public long getActiveSemesters() { return activeSemesters; }
    public void setActiveSemesters(long activeSemesters) { this.activeSemesters = activeSemesters; }

    public List<SectionSummaryDto> getSections() { return sections; }
    public void setSections(List<SectionSummaryDto> sections) { this.sections = sections; }

    // ── Inner: per-section summary ────────────────────────────────────────────
    public static class SectionSummaryDto {
        private Long sectionId;
        private String sectionName;
        private long studentCount;

        public SectionSummaryDto() {}

        public Long getSectionId() { return sectionId; }
        public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }

        public long getStudentCount() { return studentCount; }
        public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    }
}
