package com.edusphere.dto.group;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full group details: name, description, members, messages.
 */
public class GroupDetailDto {
    private Long id;
    private String name;
    private String description;
    private String groupType;
    private String currentUserRole;   // ADMIN or MEMBER
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
    private long memberCount;
    private List<GroupMemberDto> members;

    public GroupDetailDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGroupType() { return groupType; }
    public void setGroupType(String groupType) { this.groupType = groupType; }

    public String getCurrentUserRole() { return currentUserRole; }
    public void setCurrentUserRole(String currentUserRole) { this.currentUserRole = currentUserRole; }

    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getMemberCount() { return memberCount; }
    public void setMemberCount(long memberCount) { this.memberCount = memberCount; }

    public List<GroupMemberDto> getMembers() { return members; }
    public void setMembers(List<GroupMemberDto> members) { this.members = members; }
}
