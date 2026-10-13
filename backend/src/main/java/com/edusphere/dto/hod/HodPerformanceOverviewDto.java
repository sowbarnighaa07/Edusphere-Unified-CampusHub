package com.edusphere.dto.hod;

import java.math.BigDecimal;
import java.util.List;

public class HodPerformanceOverviewDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private int totalStudents;
    private int totalSubjects;
    private BigDecimal overallAverageIat1;
    private BigDecimal overallAverageIat2;
    private BigDecimal overallAverageAssignment;
    private BigDecimal overallAverageAttendance;
    private int totalDefaultersCount;
    private List<HodSubjectPerformanceDto> subjectPerformances;
    private List<HodSectionPerformanceDto> sectionPerformances;
    private List<HodAcademicDefaulterDto> defaulters;

    public HodPerformanceOverviewDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }

    public BigDecimal getOverallAverageIat1() { return overallAverageIat1; }
    public void setOverallAverageIat1(BigDecimal overallAverageIat1) { this.overallAverageIat1 = overallAverageIat1; }

    public BigDecimal getOverallAverageIat2() { return overallAverageIat2; }
    public void setOverallAverageIat2(BigDecimal overallAverageIat2) { this.overallAverageIat2 = overallAverageIat2; }

    public BigDecimal getOverallAverageAssignment() { return overallAverageAssignment; }
    public void setOverallAverageAssignment(BigDecimal overallAverageAssignment) { this.overallAverageAssignment = overallAverageAssignment; }

    public BigDecimal getOverallAverageAttendance() { return overallAverageAttendance; }
    public void setOverallAverageAttendance(BigDecimal overallAverageAttendance) { this.overallAverageAttendance = overallAverageAttendance; }

    public int getTotalDefaultersCount() { return totalDefaultersCount; }
    public void setTotalDefaultersCount(int totalDefaultersCount) { this.totalDefaultersCount = totalDefaultersCount; }

    public List<HodSubjectPerformanceDto> getSubjectPerformances() { return subjectPerformances; }
    public void setSubjectPerformances(List<HodSubjectPerformanceDto> subjectPerformances) { this.subjectPerformances = subjectPerformances; }

    public List<HodSectionPerformanceDto> getSectionPerformances() { return sectionPerformances; }
    public void setSectionPerformances(List<HodSectionPerformanceDto> sectionPerformances) { this.sectionPerformances = sectionPerformances; }

    public List<HodAcademicDefaulterDto> getDefaulters() { return defaulters; }
    public void setDefaulters(List<HodAcademicDefaulterDto> defaulters) { this.defaulters = defaulters; }
}
