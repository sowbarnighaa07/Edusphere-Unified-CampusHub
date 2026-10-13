package com.edusphere.dto.staff;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateAssignmentRequest {

    @NotNull
    private Long teachingAssignmentId;

    @NotNull
    @Size(min = 3, max = 150)
    private String title;

    private String description;

    @NotNull
    private String deadline; // ISO datetime string, parsed on backend

    @NotNull
    private Double maxMarks;

    public CreateAssignmentRequest() {}

    public Long getTeachingAssignmentId() { return teachingAssignmentId; }
    public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }
}
