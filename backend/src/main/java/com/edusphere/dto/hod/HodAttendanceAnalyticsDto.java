package com.edusphere.dto.hod;

import java.util.List;

public class HodAttendanceAnalyticsDto {

    private Long departmentId;
    private String departmentCode;
    private Double departmentAverageAttendance;
    private int totalEnrolledStudents;
    private int totalDefaultersCount; // count of records < 75%
    private List<SubjectAttendanceStatDto> subjectStats;
    private List<AttendanceDefaulterDto> defaulters;

    public HodAttendanceAnalyticsDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Double getDepartmentAverageAttendance() { return departmentAverageAttendance; }
    public void setDepartmentAverageAttendance(Double departmentAverageAttendance) { this.departmentAverageAttendance = departmentAverageAttendance; }

    public int getTotalEnrolledStudents() { return totalEnrolledStudents; }
    public void setTotalEnrolledStudents(int totalEnrolledStudents) { this.totalEnrolledStudents = totalEnrolledStudents; }

    public int getTotalDefaultersCount() { return totalDefaultersCount; }
    public void setTotalDefaultersCount(int totalDefaultersCount) { this.totalDefaultersCount = totalDefaultersCount; }

    public List<SubjectAttendanceStatDto> getSubjectStats() { return subjectStats; }
    public void setSubjectStats(List<SubjectAttendanceStatDto> subjectStats) { this.subjectStats = subjectStats; }

    public List<AttendanceDefaulterDto> getDefaulters() { return defaulters; }
    public void setDefaulters(List<AttendanceDefaulterDto> defaulters) { this.defaulters = defaulters; }

    public static class SubjectAttendanceStatDto {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer semester;
        private int totalRecords;
        private Double averageAttendance;
        private int defaulterCount;

        public SubjectAttendanceStatDto() {}

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public Integer getSemester() { return semester; }
        public void setSemester(Integer semester) { this.semester = semester; }

        public int getTotalRecords() { return totalRecords; }
        public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

        public int getDefaulterCount() { return defaulterCount; }
        public void setDefaulterCount(int defaulterCount) { this.defaulterCount = defaulterCount; }
    }

    public static class AttendanceDefaulterDto {
        private Long studentProfileId;
        private String registerNumber;
        private String studentName;
        private String sectionName;
        private String subjectCode;
        private String subjectName;
        private Integer semester;
        private Double attendancePercentage;

        public AttendanceDefaulterDto() {}

        public Long getStudentProfileId() { return studentProfileId; }
        public void setStudentProfileId(Long studentProfileId) { this.studentProfileId = studentProfileId; }

        public String getRegisterNumber() { return registerNumber; }
        public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }

        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public Integer getSemester() { return semester; }
        public void setSemester(Integer semester) { this.semester = semester; }

        public Double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    }
}
