package com.edusphere.dto.ml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MlFastApiPredictionResponse {

    @JsonProperty("predictedSemesterScore")
    private Double predictedSemesterScore;

    @JsonProperty("predicted_semester_score")
    private Double predictedSemesterScoreSnake;

    private Integer semester;
    private Boolean success;
    private String message;

    public MlFastApiPredictionResponse() {}

    public Double getPredictedSemesterScore() {
        if (predictedSemesterScore != null) return predictedSemesterScore;
        return predictedSemesterScoreSnake;
    }

    public void setPredictedSemesterScore(Double predictedSemesterScore) {
        this.predictedSemesterScore = predictedSemesterScore;
    }

    public Double getPredictedSemesterScoreSnake() {
        return predictedSemesterScoreSnake;
    }

    public void setPredictedSemesterScoreSnake(Double predictedSemesterScoreSnake) {
        this.predictedSemesterScoreSnake = predictedSemesterScoreSnake;
    }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
