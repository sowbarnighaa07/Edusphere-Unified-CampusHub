package com.edusphere.dto.student;

import java.util.ArrayList;
import java.util.List;

public class StudentAcademicHistoryDto {
    private Long studentProfileId;
    private String registerNumber;
    private String fullName;
    private String departmentCode;
    private String departmentName;
    private String sectionName;
    private Integer enrollmentYear;
    private Integer currentYear;
    private Integer currentSemester;
    private Integer totalCreditsEarned;
    private Double cumulativeAverageAttendance;
    private Integer completedSemestersCount;
    private List<SemesterHistoryDto> semesters = new ArrayList<>();

    public StudentAcademicHistoryDto() {}

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getEnrollmentYear() { return enrollmentYear; }
    public void setEnrollmentYear(Integer enrollmentYear) { this.enrollmentYear = enrollmentYear; }

    public Integer getCurrentYear() { return currentYear; }
    public void setCurrentYear(Integer currentYear) { this.currentYear = currentYear; }

    public Integer getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(Integer currentSemester) { this.currentSemester = currentSemester; }

    public Integer getTotalCreditsEarned() { return totalCreditsEarned; }
    public void setTotalCreditsEarned(Integer totalCreditsEarned) { this.totalCreditsEarned = totalCreditsEarned; }

    public Double getCumulativeAverageAttendance() { return cumulativeAverageAttendance; }
    public void setCumulativeAverageAttendance(Double cumulativeAverageAttendance) { this.cumulativeAverageAttendance = cumulativeAverageAttendance; }

    public Integer getCompletedSemestersCount() { return completedSemestersCount; }
    public void setCompletedSemestersCount(Integer completedSemestersCount) { this.completedSemestersCount = completedSemestersCount; }

    public List<SemesterHistoryDto> getSemesters() { return semesters; }
    public void setSemesters(List<SemesterHistoryDto> semesters) { this.semesters = semesters; }
}
