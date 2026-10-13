package com.edusphere.dto.admin;

public class DepartmentDetailDto {
    private Long id;
    private String name;
    private String code;
    private int sectionCount;
    private int subjectCount;
    private int facultyCount;
    private String hodName;

    public DepartmentDetailDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getSectionCount() { return sectionCount; }
    public void setSectionCount(int sectionCount) { this.sectionCount = sectionCount; }

    public int getSubjectCount() { return subjectCount; }
    public void setSubjectCount(int subjectCount) { this.subjectCount = subjectCount; }

    public int getFacultyCount() { return facultyCount; }
    public void setFacultyCount(int facultyCount) { this.facultyCount = facultyCount; }

    public String getHodName() { return hodName; }
    public void setHodName(String hodName) { this.hodName = hodName; }
}
