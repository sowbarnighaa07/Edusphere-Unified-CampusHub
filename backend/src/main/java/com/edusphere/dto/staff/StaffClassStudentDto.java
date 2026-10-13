package com.edusphere.dto.staff;

public class StaffClassStudentDto {
    private Long studentProfileId;
    private String registerNumber;
    private String fullName;
    private String email;
    private String mobileNumber;
    private Double attendancePercentage;
    private Double iat1Score;
    private Double iat2Score;
    private Double assignmentScore;

    public StaffClassStudentDto() {}

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

    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public Double getIat1Score() { return iat1Score; }
    public void setIat1Score(Double iat1Score) { this.iat1Score = iat1Score; }

    public Double getIat2Score() { return iat2Score; }
    public void setIat2Score(Double iat2Score) { this.iat2Score = iat2Score; }

    public Double getAssignmentScore() { return assignmentScore; }
    public void setAssignmentScore(Double assignmentScore) { this.assignmentScore = assignmentScore; }
}
