package com.edusphere.dto.ml;

public class StudentPredictionResponseDto {

    private Boolean available;
    private Double predictedSemesterScore;
    private Integer semester;
    private String academicYear;
    private Double currentIat1Average;
    private Double currentIat2Average;
    private Double currentAssignmentAverage;
    private Double currentAttendanceAverage;
    private Double previousSemesterScore;
    private String message;

    public StudentPredictionResponseDto() {}

    public static StudentPredictionResponseDto unavailable(String message) {
        StudentPredictionResponseDto dto = new StudentPredictionResponseDto();
        dto.setAvailable(false);
        dto.setMessage(message);
        return dto;
    }

    public static StudentPredictionResponseDto unavailable(Integer semester, String academicYear, String message) {
        StudentPredictionResponseDto dto = new StudentPredictionResponseDto();
        dto.setAvailable(false);
        dto.setSemester(semester);
        dto.setAcademicYear(academicYear);
        dto.setMessage(message);
        return dto;
    }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Double getPredictedSemesterScore() { return predictedSemesterScore; }
    public void setPredictedSemesterScore(Double predictedSemesterScore) { this.predictedSemesterScore = predictedSemesterScore; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Double getCurrentIat1Average() { return currentIat1Average; }
    public void setCurrentIat1Average(Double currentIat1Average) { this.currentIat1Average = currentIat1Average; }

    public Double getCurrentIat2Average() { return currentIat2Average; }
    public void setCurrentIat2Average(Double currentIat2Average) { this.currentIat2Average = currentIat2Average; }

    public Double getCurrentAssignmentAverage() { return currentAssignmentAverage; }
    public void setCurrentAssignmentAverage(Double currentAssignmentAverage) { this.currentAssignmentAverage = currentAssignmentAverage; }

    public Double getCurrentAttendanceAverage() { return currentAttendanceAverage; }
    public void setCurrentAttendanceAverage(Double currentAttendanceAverage) { this.currentAttendanceAverage = currentAttendanceAverage; }

    public Double getPreviousSemesterScore() { return previousSemesterScore; }
    public void setPreviousSemesterScore(Double previousSemesterScore) { this.previousSemesterScore = previousSemesterScore; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
