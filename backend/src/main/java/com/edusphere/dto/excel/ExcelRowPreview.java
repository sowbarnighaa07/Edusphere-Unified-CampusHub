package com.edusphere.dto.excel;

/**
 * Represents a single data row from the uploaded Excel file after parsing.
 * Carries validation status and reason.
 */
public class ExcelRowPreview {

    private int rowNumber;          // 1-based Excel row index
    private String registerNumber;  // Col A
    private String studentName;     // Col B (informational only)
    private Double value;           // Col C — attendance % or IAT score
    private boolean valid;
    private String errorReason;     // null when valid

    // Resolved from DB — only set for valid rows
    private Long studentProfileId;

    public ExcelRowPreview() {}

    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getErrorReason() { return errorReason; }
    public void setErrorReason(String errorReason) { this.errorReason = errorReason; }

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }
}
