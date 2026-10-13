package com.edusphere.dto.admin;

public class RegistrationDecisionRequest {
    private String remarks;

    public RegistrationDecisionRequest() {}

    public RegistrationDecisionRequest(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
