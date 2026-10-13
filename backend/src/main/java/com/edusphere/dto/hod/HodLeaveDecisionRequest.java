package com.edusphere.dto.hod;

import com.edusphere.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public class HodLeaveDecisionRequest {

    @NotNull(message = "Decision status is required (APPROVED or REJECTED)")
    private LeaveStatus status;

    private String remarks;

    public HodLeaveDecisionRequest() {}

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
