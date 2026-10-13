package com.edusphere.dto.student;

import java.util.List;

public class StudentAcademicOverviewDto {
    private String registerNumber;
    private String fullName;
    private String departmentName;
    private String departmentCode;
    private String sectionName;
    private Integer currentSemester;
    private Integer currentYear;
    private String academicYear;
    private int totalCredits;
    private Double averageAttendancePercentage;
    private List<StudentEnrolledSubjectDto> subjects;

    public StudentAcademicOverviewDto() {}

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(Integer currentSemester) { this.currentSemester = currentSemester; }

    public Integer getCurrentYear() { return currentYear; }
    public void setCurrentYear(Integer currentYear) { this.currentYear = currentYear; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public int getTotalCredits() { return totalCredits; }
    public void setTotalCredits(int totalCredits) { this.totalCredits = totalCredits; }

    public Double getAverageAttendancePercentage() { return averageAttendancePercentage; }
    public void setAverageAttendancePercentage(Double averageAttendancePercentage) { this.averageAttendancePercentage = averageAttendancePercentage; }

    public List<StudentEnrolledSubjectDto> getSubjects() { return subjects; }
    public void setSubjects(List<StudentEnrolledSubjectDto> subjects) { this.subjects = subjects; }
}
