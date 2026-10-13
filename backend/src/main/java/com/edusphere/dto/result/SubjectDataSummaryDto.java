package com.edusphere.dto.result;

public class SubjectDataSummaryDto {
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer credits;
    private String facultyName;
    private int recordedStudentsCount;
    private int totalStudentsCount;
    private boolean isComplete;

    public SubjectDataSummaryDto() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public int getRecordedStudentsCount() { return recordedStudentsCount; }
    public void setRecordedStudentsCount(int recordedStudentsCount) { this.recordedStudentsCount = recordedStudentsCount; }

    public int getTotalStudentsCount() { return totalStudentsCount; }
    public void setTotalStudentsCount(int totalStudentsCount) { this.totalStudentsCount = totalStudentsCount; }

    public boolean isComplete() { return isComplete; }
    public void setComplete(boolean complete) { isComplete = complete; }
}
