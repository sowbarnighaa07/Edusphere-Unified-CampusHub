package com.edusphere.dto.excel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for the confirm/commit step.
 * The importToken ties back to the cached preview so nothing needs re-parsing.
 */
public class ExcelConfirmRequest {

    @NotBlank
    private String importToken;

    @NotNull
    private Long teachingAssignmentId; // Re-validated server-side against the token

    public ExcelConfirmRequest() {}

    public String getImportToken() { return importToken; }
    public void setImportToken(String importToken) { this.importToken = importToken; }

    public Long getTeachingAssignmentId() { return teachingAssignmentId; }
    public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }
}
