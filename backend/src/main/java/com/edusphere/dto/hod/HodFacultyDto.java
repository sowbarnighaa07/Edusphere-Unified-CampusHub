package com.edusphere.dto.hod;

import java.util.List;

public class HodFacultyDto {

    private Long staffProfileId;
    private String employeeId;
    private String fullName;
    private String email;
    private String designation;
    private String qualification;
    private Integer joiningYear;
    private String mobileNumber;
    private int assignedClassesCount;
    private List<FacultyTeachingAssignmentDto> teachingAssignments;

    public HodFacultyDto() {}

    public Long getStaffProfileId() { return staffProfileId; }
    public void setStaffProfileId(Long staffProfileId) { this.staffProfileId = staffProfileId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public int getAssignedClassesCount() { return assignedClassesCount; }
    public void setAssignedClassesCount(int assignedClassesCount) { this.assignedClassesCount = assignedClassesCount; }

    public List<FacultyTeachingAssignmentDto> getTeachingAssignments() { return teachingAssignments; }
    public void setTeachingAssignments(List<FacultyTeachingAssignmentDto> teachingAssignments) { this.teachingAssignments = teachingAssignments; }

    public static class FacultyTeachingAssignmentDto {
        private Long teachingAssignmentId;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Long sectionId;
        private String sectionName;
        private Integer semester;
        private String academicYear;
        private int credits;

        public FacultyTeachingAssignmentDto() {}

        public Long getTeachingAssignmentId() { return teachingAssignmentId; }
        public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public Long getSectionId() { return sectionId; }
        public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }

        public Integer getSemester() { return semester; }
        public void setSemester(Integer semester) { this.semester = semester; }

        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

        public int getCredits() { return credits; }
        public void setCredits(int credits) { this.credits = credits; }
    }
}
