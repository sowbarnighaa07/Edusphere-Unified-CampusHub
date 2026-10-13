package com.edusphere.dto.excel;

import java.util.List;

/**
 * Immutable preview result returned to frontend after Excel upload.
 * Nothing is written to the database at this stage.
 */
public class ExcelPreviewResponse {

    private String importToken;          // UUID key for the confirm step
    private String importType;           // ATTENDANCE | IAT1 | IAT2
    private Long teachingAssignmentId;
    private String subjectCode;
    private String subjectName;
    private String sectionName;
    private Integer semester;
    private String academicYear;
    private String fileName;
    private int totalRows;
    private int validRows;
    private int invalidRows;
    private boolean hasErrors;
    private List<ExcelRowPreview> rows;

    public ExcelPreviewResponse() {}

    public String getImportToken() { return importToken; }
    public void setImportToken(String importToken) { this.importToken = importToken; }

    public String getImportType() { return importType; }
    public void setImportType(String importType) { this.importType = importType; }

    public Long getTeachingAssignmentId() { return teachingAssignmentId; }
    public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getValidRows() { return validRows; }
    public void setValidRows(int validRows) { this.validRows = validRows; }

    public int getInvalidRows() { return invalidRows; }
    public void setInvalidRows(int invalidRows) { this.invalidRows = invalidRows; }

    public boolean isHasErrors() { return hasErrors; }
    public void setHasErrors(boolean hasErrors) { this.hasErrors = hasErrors; }

    public List<ExcelRowPreview> getRows() { return rows; }
    public void setRows(List<ExcelRowPreview> rows) { this.rows = rows; }
}
