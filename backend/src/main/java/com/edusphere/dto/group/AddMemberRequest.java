package com.edusphere.dto.group;

/**
 * Request body for adding a member to a group.
 * Staff/HOD/Admin can specify userId or register number.
 */
public class AddMemberRequest {
    private Long userId;
    private String registerNumber;   // alternative to userId for adding students
    private String memberRole;       // ADMIN or MEMBER (defaults to MEMBER if blank)

    public AddMemberRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getMemberRole() { return memberRole; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }
}
