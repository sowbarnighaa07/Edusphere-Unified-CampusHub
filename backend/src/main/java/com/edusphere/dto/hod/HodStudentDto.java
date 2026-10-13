package com.edusphere.dto.hod;

public class HodStudentDto {

    private Long studentProfileId;
    private String registerNumber;
    private String fullName;
    private String email;
    private String mobileNumber;
    private Long sectionId;
    private String sectionName;
    private Integer enrollmentYear;
    private Integer expectedGraduationYear;
    private Integer currentYear;
    private Double overallAttendancePercentage;
    private Integer totalSubjectsCount;
    private String status;

    public HodStudentDto() {}

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getEnrollmentYear() { return enrollmentYear; }
    public void setEnrollmentYear(Integer enrollmentYear) { this.enrollmentYear = enrollmentYear; }

    public Integer getExpectedGraduationYear() { return expectedGraduationYear; }
    public void setExpectedGraduationYear(Integer expectedGraduationYear) { this.expectedGraduationYear = expectedGraduationYear; }

    public Integer getCurrentYear() { return currentYear; }
    public void setCurrentYear(Integer currentYear) { this.currentYear = currentYear; }

    public Double getOverallAttendancePercentage() { return overallAttendancePercentage; }
    public void setOverallAttendancePercentage(Double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; }

    public Integer getTotalSubjectsCount() { return totalSubjectsCount; }
    public void setTotalSubjectsCount(Integer totalSubjectsCount) { this.totalSubjectsCount = totalSubjectsCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
