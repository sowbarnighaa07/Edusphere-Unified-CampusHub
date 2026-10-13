package com.edusphere.dto.student;

public class UpdateStudentPortfolioRequest {

    private String about;
    private String skills;
    private String projects;
    private String careerObjective;
    private String githubUrl;
    private String linkedinUrl;

    public UpdateStudentPortfolioRequest() {}

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
}
