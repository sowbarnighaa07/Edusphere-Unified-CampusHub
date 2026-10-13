package com.edusphere.dto.hod;

public class FacultyWorkloadReportDto {
    private Long staffProfileId;
    private String employeeId;
    private String fullName;
    private String designation;
    private int assignedClassesCount;
    private int totalStudents;

    public FacultyWorkloadReportDto() {}

    public Long getStaffProfileId() { return staffProfileId; }
    public void setStaffProfileId(Long staffProfileId) { this.staffProfileId = staffProfileId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public int getAssignedClassesCount() { return assignedClassesCount; }
    public void setAssignedClassesCount(int assignedClassesCount) { this.assignedClassesCount = assignedClassesCount; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
}
