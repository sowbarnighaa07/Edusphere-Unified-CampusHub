package com.edusphere.dto.hod;

import java.math.BigDecimal;

public class HodSectionPerformanceDto {
    private Long sectionId;
    private String sectionName;
    private Integer semester;
    private int studentCount;
    private BigDecimal averageIat1;
    private BigDecimal averageIat2;
    private BigDecimal averageAttendance;

    public HodSectionPerformanceDto() {}

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }

    public BigDecimal getAverageIat1() { return averageIat1; }
    public void setAverageIat1(BigDecimal averageIat1) { this.averageIat1 = averageIat1; }

    public BigDecimal getAverageIat2() { return averageIat2; }
    public void setAverageIat2(BigDecimal averageIat2) { this.averageIat2 = averageIat2; }

    public BigDecimal getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(BigDecimal averageAttendance) { this.averageAttendance = averageAttendance; }
}
