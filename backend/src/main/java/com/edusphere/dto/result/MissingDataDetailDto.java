package com.edusphere.dto.result;

import java.util.List;

public class MissingDataDetailDto {
    private Long studentId;
    private String registerNumber;
    private String studentName;
    private String subjectCode;
    private String subjectName;
    private List<String> missingFields;

    public MissingDataDetailDto() {}

    public MissingDataDetailDto(Long studentId, String registerNumber, String studentName, String subjectCode, String subjectName, List<String> missingFields) {
        this.studentId = studentId;
        this.registerNumber = registerNumber;
        this.studentName = studentName;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.missingFields = missingFields;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }
}
