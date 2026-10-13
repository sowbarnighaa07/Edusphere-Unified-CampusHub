package com.edusphere.dto.student;

import com.edusphere.dto.achievement.AchievementDto;
import java.util.List;

public class StudentPortfolioDto {

    private Long studentProfileId;
    private String registerNumber;
    private String fullName;
    private String email;
    private String departmentName;
    private String departmentCode;
    private String sectionName;
    private Integer enrollmentYear;
    private Integer expectedGraduationYear;

    private String about;
    private String skills;
    private String projects;
    private String careerObjective;
    private String githubUrl;
    private String linkedinUrl;

    private List<AchievementDto> verifiedAchievements;

    public StudentPortfolioDto() {}

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public Integer getEnrollmentYear() { return enrollmentYear; }
    public void setEnrollmentYear(Integer enrollmentYear) { this.enrollmentYear = enrollmentYear; }

    public Integer getExpectedGraduationYear() { return expectedGraduationYear; }
    public void setExpectedGraduationYear(Integer expectedGraduationYear) { this.expectedGraduationYear = expectedGraduationYear; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getCareerObjective() { return careerObjective; }
    public void setCareerObjective(String careerObjective) { this.careerObjective = careerObjective; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public List<AchievementDto> getVerifiedAchievements() { return verifiedAchievements; }
    public void setVerifiedAchievements(List<AchievementDto> verifiedAchievements) { this.verifiedAchievements = verifiedAchievements; }
}
