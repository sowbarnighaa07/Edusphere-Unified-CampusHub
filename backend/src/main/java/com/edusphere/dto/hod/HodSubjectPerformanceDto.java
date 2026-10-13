package com.edusphere.dto.hod;

import java.math.BigDecimal;

public class HodSubjectPerformanceDto {
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer semester;
    private int totalStudents;
    private BigDecimal averageIat1;
    private BigDecimal averageIat2;
    private BigDecimal averageAssignment;
    private BigDecimal averageAttendance;
    private BigDecimal passPercentage;

    public HodSubjectPerformanceDto() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public BigDecimal getAverageIat1() { return averageIat1; }
    public void setAverageIat1(BigDecimal averageIat1) { this.averageIat1 = averageIat1; }

    public BigDecimal getAverageIat2() { return averageIat2; }
    public void setAverageIat2(BigDecimal averageIat2) { this.averageIat2 = averageIat2; }

    public BigDecimal getAverageAssignment() { return averageAssignment; }
    public void setAverageAssignment(BigDecimal averageAssignment) { this.averageAssignment = averageAssignment; }

    public BigDecimal getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(BigDecimal averageAttendance) { this.averageAttendance = averageAttendance; }

    public BigDecimal getPassPercentage() { return passPercentage; }
    public void setPassPercentage(BigDecimal passPercentage) { this.passPercentage = passPercentage; }
}
