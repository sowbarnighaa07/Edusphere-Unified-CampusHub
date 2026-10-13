package com.edusphere.dto.result;

import com.edusphere.entity.ResultStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SemesterResultSummaryDto {
    private Long id;
    private Long studentId;
    private String registerNumber;
    private String studentName;
    private Long sectionId;
    private String sectionName;
    private Integer semester;
    private String academicYear;
    private BigDecimal actualSemesterScore;
    private BigDecimal predictedSemesterScore;
    private String grade;
    private ResultStatus status;
    private Integer totalCredits;
    private Integer creditsEarned;
    private LocalDateTime verifiedAt;
    private String verifiedByName;
    private LocalDateTime publishedAt;
    private String publishedByName;

    public SemesterResultSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public BigDecimal getActualSemesterScore() { return actualSemesterScore; }
    public void setActualSemesterScore(BigDecimal actualSemesterScore) { this.actualSemesterScore = actualSemesterScore; }

    public BigDecimal getPredictedSemesterScore() { return predictedSemesterScore; }
    public void setPredictedSemesterScore(BigDecimal predictedSemesterScore) { this.predictedSemesterScore = predictedSemesterScore; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }

    public Integer getCreditsEarned() { return creditsEarned; }
    public void setCreditsEarned(Integer creditsEarned) { this.creditsEarned = creditsEarned; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedByName() { return verifiedByName; }
    public void setVerifiedByName(String verifiedByName) { this.verifiedByName = verifiedByName; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getPublishedByName() { return publishedByName; }
    public void setPublishedByName(String publishedByName) { this.publishedByName = publishedByName; }
}
