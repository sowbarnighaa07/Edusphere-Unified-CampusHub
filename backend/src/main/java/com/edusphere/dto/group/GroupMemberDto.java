package com.edusphere.dto.group;

import java.time.LocalDateTime;

/**
 * Single member entry shown in group details.
 */
public class GroupMemberDto {
    private Long userId;
    private String fullName;
    private String role;          // user system role: STUDENT, STAFF, HOD, ADMIN
    private String memberRole;    // group role: ADMIN, MEMBER
    private String registerNumber;   // only if student
    private String employeeId;       // only if staff/hod
    private String departmentName;
    private LocalDateTime joinedAt;

    public GroupMemberDto() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMemberRole() { return memberRole; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
