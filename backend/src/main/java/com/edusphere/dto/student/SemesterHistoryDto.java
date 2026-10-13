package com.edusphere.dto.student;

import com.edusphere.entity.ResultStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SemesterHistoryDto {
    private Integer semester;
    private String academicYear;
    private Integer totalCredits;
    private Integer creditsEarned;
    private Double averageAttendancePercentage;
    private BigDecimal actualSemesterScore;
    private BigDecimal predictedSemesterScore;
    private String grade;
    private ResultStatus status;
    private LocalDateTime publishedAt;
    private List<StudentEnrolledSubjectDto> subjects = new ArrayList<>();

    public SemesterHistoryDto() {}

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }

    public Integer getCreditsEarned() { return creditsEarned; }
    public void setCreditsEarned(Integer creditsEarned) { this.creditsEarned = creditsEarned; }

    public Double getAverageAttendancePercentage() { return averageAttendancePercentage; }
    public void setAverageAttendancePercentage(Double averageAttendancePercentage) { this.averageAttendancePercentage = averageAttendancePercentage; }

    public BigDecimal getActualSemesterScore() { return actualSemesterScore; }
    public void setActualSemesterScore(BigDecimal actualSemesterScore) { this.actualSemesterScore = actualSemesterScore; }

    public BigDecimal getPredictedSemesterScore() { return predictedSemesterScore; }
    public void setPredictedSemesterScore(BigDecimal predictedSemesterScore) { this.predictedSemesterScore = predictedSemesterScore; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public List<StudentEnrolledSubjectDto> getSubjects() { return subjects; }
    public void setSubjects(List<StudentEnrolledSubjectDto> subjects) { this.subjects = subjects; }
}
