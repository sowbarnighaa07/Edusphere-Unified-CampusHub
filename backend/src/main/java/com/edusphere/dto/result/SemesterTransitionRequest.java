package com.edusphere.dto.result;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SemesterTransitionRequest {

    @NotNull(message = "Section ID is required")
    private Long sectionId;

    @NotNull(message = "From semester is required")
    private Integer fromSemester;

    @NotNull(message = "To semester is required")
    private Integer toSemester;

    @NotBlank(message = "From academic year is required")
    private String fromAcademicYear;

    @NotBlank(message = "To academic year is required")
    private String toAcademicYear;

    public SemesterTransitionRequest() {}

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public Integer getFromSemester() { return fromSemester; }
    public void setFromSemester(Integer fromSemester) { this.fromSemester = fromSemester; }

    public Integer getToSemester() { return toSemester; }
    public void setToSemester(Integer toSemester) { this.toSemester = toSemester; }

    public String getFromAcademicYear() { return fromAcademicYear; }
    public void setFromAcademicYear(String fromAcademicYear) { this.fromAcademicYear = fromAcademicYear; }

    public String getToAcademicYear() { return toAcademicYear; }
    public void setToAcademicYear(String toAcademicYear) { this.toAcademicYear = toAcademicYear; }
}
