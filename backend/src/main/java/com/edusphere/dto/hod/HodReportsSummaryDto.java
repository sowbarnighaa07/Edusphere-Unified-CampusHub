package com.edusphere.dto.hod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class HodReportsSummaryDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private LocalDateTime generatedAt;

    private int totalStudents;
    private int totalFaculty;
    private int totalSections;
    private int totalSubjects;

    private BigDecimal averageAttendance;
    private int attendanceDefaultersCount;

    private BigDecimal averageIat1;
    private BigDecimal averageIat2;

    private int totalAssignments;
    private int totalSubmissions;
    private int verifiedAchievementsCount;

    private List<FacultyWorkloadReportDto> facultyWorkloads;
    private List<HodSubjectPerformanceDto> subjectPerformances;

    public HodReportsSummaryDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(int totalFaculty) { this.totalFaculty = totalFaculty; }

    public int getTotalSections() { return totalSections; }
    public void setTotalSections(int totalSections) { this.totalSections = totalSections; }

    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }

    public BigDecimal getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(BigDecimal averageAttendance) { this.averageAttendance = averageAttendance; }

    public int getAttendanceDefaultersCount() { return attendanceDefaultersCount; }
    public void setAttendanceDefaultersCount(int attendanceDefaultersCount) { this.attendanceDefaultersCount = attendanceDefaultersCount; }

    public BigDecimal getAverageIat1() { return averageIat1; }
    public void setAverageIat1(BigDecimal averageIat1) { this.averageIat1 = averageIat1; }

    public BigDecimal getAverageIat2() { return averageIat2; }
    public void setAverageIat2(BigDecimal averageIat2) { this.averageIat2 = averageIat2; }

    public int getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(int totalAssignments) { this.totalAssignments = totalAssignments; }

    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public int getVerifiedAchievementsCount() { return verifiedAchievementsCount; }
    public void setVerifiedAchievementsCount(int verifiedAchievementsCount) { this.verifiedAchievementsCount = verifiedAchievementsCount; }

    public List<FacultyWorkloadReportDto> getFacultyWorkloads() { return facultyWorkloads; }
    public void setFacultyWorkloads(List<FacultyWorkloadReportDto> facultyWorkloads) { this.facultyWorkloads = facultyWorkloads; }

    public List<HodSubjectPerformanceDto> getSubjectPerformances() { return subjectPerformances; }
    public void setSubjectPerformances(List<HodSubjectPerformanceDto> subjectPerformances) { this.subjectPerformances = subjectPerformances; }
}
