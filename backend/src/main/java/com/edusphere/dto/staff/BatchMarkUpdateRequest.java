package com.edusphere.dto.staff;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class BatchMarkUpdateRequest {

    @NotNull
    private Long teachingAssignmentId;

    @NotNull
    private String field; // "iat1Score", "iat2Score", "assignmentScore", "attendancePercentage"

    @NotNull
    @Valid
    private List<StudentMarkEntry> entries;

    public BatchMarkUpdateRequest() {}

    public Long getTeachingAssignmentId() { return teachingAssignmentId; }
    public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public List<StudentMarkEntry> getEntries() { return entries; }
    public void setEntries(List<StudentMarkEntry> entries) { this.entries = entries; }

    public static class StudentMarkEntry {
        @NotNull
        private Long studentProfileId;
        private Double value; // null = clear the field

        public StudentMarkEntry() {}

        public Long getStudentProfileId() { return studentProfileId; }
        public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
    }
}
