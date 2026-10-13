package com.edusphere.dto.admin;

import jakarta.validation.constraints.*;

public class CreateSubjectRequest {

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Subject code is required (e.g. CS8101)")
    private String code;

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be between 1 and 8")
    @Max(value = 8, message = "Semester must be between 1 and 8")
    private Integer semester;

    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be between 1 and 10")
    @Max(value = 10, message = "Credits must be between 1 and 10")
    private Integer credits;

    public CreateSubjectRequest() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
}
