package com.edusphere.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MlFastApiPredictionRequest {

    private Integer semester;
    private Double iat1;
    private Double iat2;
    private Double assignment;
    private Double attendance;

    @JsonProperty("previous_semester_score")
    private Double previousSemesterScore;

    public MlFastApiPredictionRequest() {}

    public MlFastApiPredictionRequest(Integer semester, Double iat1, Double iat2, Double assignment, Double attendance, Double previousSemesterScore) {
        this.semester = semester;
        this.iat1 = iat1;
        this.iat2 = iat2;
        this.assignment = assignment;
        this.attendance = attendance;
        this.previousSemesterScore = previousSemesterScore;
    }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Double getIat1() { return iat1; }
    public void setIat1(Double iat1) { this.iat1 = iat1; }

    public Double getIat2() { return iat2; }
    public void setIat2(Double iat2) { this.iat2 = iat2; }

    public Double getAssignment() { return assignment; }
    public void setAssignment(Double assignment) { this.assignment = assignment; }

    public Double getAttendance() { return attendance; }
    public void setAttendance(Double attendance) { this.attendance = attendance; }

    public Double getPreviousSemesterScore() { return previousSemesterScore; }
    public void setPreviousSemesterScore(Double previousSemesterScore) { this.previousSemesterScore = previousSemesterScore; }
}
