package com.edusphere.dto.staff;

import java.util.List;

public class StaffPerformanceOverviewDto {

    private Long teachingAssignmentId;
    private String subjectCode;
    private String subjectName;
    private String sectionName;
    private String departmentName;
    private Integer semester;
    private String academicYear;

    private int totalStudents;
    private int evaluatedIat1Count;
    private Double averageIat1;
    private int evaluatedIat2Count;
    private Double averageIat2;
    private int evaluatedAssignmentCount;
    private Double averageAssignment;
    private Double averageAttendance;
    private int attendanceDefaultersCount; // < 75%
    private int highAttendanceCount;      // >= 85%
    private int moderateAttendanceCount;  // 75% - 84.9%

    private List<StudentAcademicRecordDto> studentRecords;

    public StaffPerformanceOverviewDto() {}

    public Long getTeachingAssignmentId() { return teachingAssignmentId; }
    public void setTeachingAssignmentId(Long teachingAssignmentId) { this.teachingAssignmentId = teachingAssignmentId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getEvaluatedIat1Count() { return evaluatedIat1Count; }
    public void setEvaluatedIat1Count(int evaluatedIat1Count) { this.evaluatedIat1Count = evaluatedIat1Count; }

    public Double getAverageIat1() { return averageIat1; }
    public void setAverageIat1(Double averageIat1) { this.averageIat1 = averageIat1; }

    public int getEvaluatedIat2Count() { return evaluatedIat2Count; }
    public void setEvaluatedIat2Count(int evaluatedIat2Count) { this.evaluatedIat2Count = evaluatedIat2Count; }

    public Double getAverageIat2() { return averageIat2; }
    public void setAverageIat2(Double averageIat2) { this.averageIat2 = averageIat2; }

    public int getEvaluatedAssignmentCount() { return evaluatedAssignmentCount; }
    public void setEvaluatedAssignmentCount(int evaluatedAssignmentCount) { this.evaluatedAssignmentCount = evaluatedAssignmentCount; }

    public Double getAverageAssignment() { return averageAssignment; }
    public void setAverageAssignment(Double averageAssignment) { this.averageAssignment = averageAssignment; }

    public Double getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

    public int getAttendanceDefaultersCount() { return attendanceDefaultersCount; }
    public void setAttendanceDefaultersCount(int attendanceDefaultersCount) { this.attendanceDefaultersCount = attendanceDefaultersCount; }

    public int getHighAttendanceCount() { return highAttendanceCount; }
    public void setHighAttendanceCount(int highAttendanceCount) { this.highAttendanceCount = highAttendanceCount; }

    public int getModerateAttendanceCount() { return moderateAttendanceCount; }
    public void setModerateAttendanceCount(int moderateAttendanceCount) { this.moderateAttendanceCount = moderateAttendanceCount; }

    public List<StudentAcademicRecordDto> getStudentRecords() { return studentRecords; }
    public void setStudentRecords(List<StudentAcademicRecordDto> studentRecords) { this.studentRecords = studentRecords; }
}
