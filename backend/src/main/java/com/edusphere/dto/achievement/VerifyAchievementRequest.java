package com.edusphere.dto.achievement;

import com.edusphere.entity.AchievementStatus;
import jakarta.validation.constraints.NotNull;

public class VerifyAchievementRequest {

    @NotNull(message = "Status is required (VERIFIED or REJECTED)")
    private AchievementStatus status;

    private String remarks;

    public VerifyAchievementRequest() {}

    public AchievementStatus getStatus() { return status; }
    public void setStatus(AchievementStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
