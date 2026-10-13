package com.edusphere.dto.leave;

import com.edusphere.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public class StaffLeaveReviewRequest {

    @NotNull(message = "Review status is required (PENDING_HOD to recommend, or REJECTED to reject)")
    private LeaveStatus status;

    private String remarks;

    public StaffLeaveReviewRequest() {}

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
