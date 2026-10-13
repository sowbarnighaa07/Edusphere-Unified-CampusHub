package com.edusphere.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@EntityListeners(AuditingEntityListener.class)
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(length = 255)
    private String attachmentPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveStatus status = LeaveStatus.PENDING_STAFF;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_reviewer_id")
    private StaffProfile staffReviewer;

    @Column(columnDefinition = "TEXT")
    private String staffRemarks;

    private LocalDateTime staffReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_reviewer_id")
    private HodProfile hodReviewer;

    @Column(columnDefinition = "TEXT")
    private String hodRemarks;

    private LocalDateTime hodReviewedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public LeaveRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }

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

    public StaffProfile getStaffReviewer() { return staffReviewer; }
    public void setStaffReviewer(StaffProfile staffReviewer) { this.staffReviewer = staffReviewer; }

    public String getStaffRemarks() { return staffRemarks; }
    public void setStaffRemarks(String staffRemarks) { this.staffRemarks = staffRemarks; }

    public LocalDateTime getStaffReviewedAt() { return staffReviewedAt; }
    public void setStaffReviewedAt(LocalDateTime staffReviewedAt) { this.staffReviewedAt = staffReviewedAt; }

    public HodProfile getHodReviewer() { return hodReviewer; }
    public void setHodReviewer(HodProfile hodReviewer) { this.hodReviewer = hodReviewer; }

    public String getHodRemarks() { return hodRemarks; }
    public void setHodRemarks(String hodRemarks) { this.hodRemarks = hodRemarks; }

    public LocalDateTime getHodReviewedAt() { return hodReviewedAt; }
    public void setHodReviewedAt(LocalDateTime hodReviewedAt) { this.hodReviewedAt = hodReviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
