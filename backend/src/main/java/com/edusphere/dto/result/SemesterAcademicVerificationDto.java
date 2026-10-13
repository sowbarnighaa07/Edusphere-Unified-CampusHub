package com.edusphere.dto.result;

import java.util.ArrayList;
import java.util.List;

public class SemesterAcademicVerificationDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long sectionId;
    private String sectionName;
    private Integer semester;
    private String academicYear;

    private int totalStudents;
    private int totalSubjects;
    private int expectedRecords;
    private int completedRecords;
    private int missingRecords;
    private boolean isReadyForGeneration;
    private String statusMessage;

    private List<SubjectDataSummaryDto> subjectSummaries = new ArrayList<>();
    private List<MissingDataDetailDto> missingRecordDetails = new ArrayList<>();

    public SemesterAcademicVerificationDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }

    public int getExpectedRecords() { return expectedRecords; }
    public void setExpectedRecords(int expectedRecords) { this.expectedRecords = expectedRecords; }

    public int getCompletedRecords() { return completedRecords; }
    public void setCompletedRecords(int completedRecords) { this.completedRecords = completedRecords; }

    public int getMissingRecords() { return missingRecords; }
    public void setMissingRecords(int missingRecords) { this.missingRecords = missingRecords; }

    public boolean isReadyForGeneration() { return isReadyForGeneration; }
    public void setReadyForGeneration(boolean readyForGeneration) { isReadyForGeneration = readyForGeneration; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public List<SubjectDataSummaryDto> getSubjectSummaries() { return subjectSummaries; }
    public void setSubjectSummaries(List<SubjectDataSummaryDto> subjectSummaries) { this.subjectSummaries = subjectSummaries; }

    public List<MissingDataDetailDto> getMissingRecordDetails() { return missingRecordDetails; }
    public void setMissingRecordDetails(List<MissingDataDetailDto> missingRecordDetails) { this.missingRecordDetails = missingRecordDetails; }
}
