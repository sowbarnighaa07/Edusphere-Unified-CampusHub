package com.edusphere.dto.hod;

import java.math.BigDecimal;

public class HodAcademicDefaulterDto {
    private Long studentProfileId;
    private String registerNumber;
    private String studentName;
    private String sectionName;
    private String subjectCode;
    private String subjectName;
    private BigDecimal iat1Score;
    private BigDecimal iat2Score;
    private BigDecimal attendancePercentage;

    public HodAcademicDefaulterDto() {}

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public BigDecimal getIat1Score() { return iat1Score; }
    public void setIat1Score(BigDecimal iat1Score) { this.iat1Score = iat1Score; }

    public BigDecimal getIat2Score() { return iat2Score; }
    public void setIat2Score(BigDecimal iat2Score) { this.iat2Score = iat2Score; }

    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }
}
