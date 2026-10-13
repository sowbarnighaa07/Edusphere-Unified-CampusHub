package com.edusphere.dto.leave;

import com.edusphere.entity.LeaveStatus;
import com.edusphere.entity.LeaveType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveResponseDto {

    private Long id;
    private Long studentProfileId;
    private String registerNumber;
    private String studentName;
    private String departmentName;
    private String sectionName;
    private LeaveType leaveType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
    private String attachmentPath;
    private LeaveStatus status;
    private String staffReviewerName;
    private String staffRemarks;
    private LocalDateTime staffReviewedAt;
    private String hodReviewerName;
    private String hodRemarks;
    private LocalDateTime hodReviewedAt;
    private LocalDateTime createdAt;

    public LeaveResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public String getStaffReviewerName() { return staffReviewerName; }
    public void setStaffReviewerName(String staffReviewerName) { this.staffReviewerName = staffReviewerName; }

    public String getStaffRemarks() { return staffRemarks; }
    public void setStaffRemarks(String staffRemarks) { this.staffRemarks = staffRemarks; }

    public LocalDateTime getStaffReviewedAt() { return staffReviewedAt; }
    public void setStaffReviewedAt(LocalDateTime staffReviewedAt) { this.staffReviewedAt = staffReviewedAt; }

    public String getHodReviewerName() { return hodReviewerName; }
    public void setHodReviewerName(String hodReviewerName) { this.hodReviewerName = hodReviewerName; }

    public String getHodRemarks() { return hodRemarks; }
    public void setHodRemarks(String hodRemarks) { this.hodRemarks = hodRemarks; }

    public LocalDateTime getHodReviewedAt() { return hodReviewedAt; }
    public void setHodReviewedAt(LocalDateTime hodReviewedAt) { this.hodReviewedAt = hodReviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
