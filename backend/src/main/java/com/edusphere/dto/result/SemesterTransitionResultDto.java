package com.edusphere.dto.result;

import java.time.LocalDateTime;

public class SemesterTransitionResultDto {
    private Long sectionId;
    private String sectionName;
    private String departmentName;
    private int transitionedStudentsCount;
    private Integer previousSemester;
    private Integer newSemester;
    private String previousAcademicYear;
    private String newAcademicYear;
    private LocalDateTime transitionedAt;
    private String statusMessage;

    public SemesterTransitionResultDto() {}

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public int getTransitionedStudentsCount() { return transitionedStudentsCount; }
    public void setTransitionedStudentsCount(int transitionedStudentsCount) { this.transitionedStudentsCount = transitionedStudentsCount; }

    public Integer getPreviousSemester() { return previousSemester; }
    public void setPreviousSemester(Integer previousSemester) { this.previousSemester = previousSemester; }

    public Integer getNewSemester() { return newSemester; }
    public void setNewSemester(Integer newSemester) { this.newSemester = newSemester; }

    public String getPreviousAcademicYear() { return previousAcademicYear; }
    public void setPreviousAcademicYear(String previousAcademicYear) { this.previousAcademicYear = previousAcademicYear; }

    public String getNewAcademicYear() { return newAcademicYear; }
    public void setNewAcademicYear(String newAcademicYear) { this.newAcademicYear = newAcademicYear; }

    public LocalDateTime getTransitionedAt() { return transitionedAt; }
    public void setTransitionedAt(LocalDateTime transitionedAt) { this.transitionedAt = transitionedAt; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
}
