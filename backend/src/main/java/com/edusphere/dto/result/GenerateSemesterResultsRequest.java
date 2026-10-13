package com.edusphere.dto.result;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GenerateSemesterResultsRequest {

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Section ID is required")
    private Long sectionId;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    public GenerateSemesterResultsRequest() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
