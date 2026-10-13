package com.edusphere.dto.group;

import java.time.LocalDateTime;

/**
 * Summary of a group shown in the sidebar list.
 * Includes unread count and latest message preview.
 */
public class GroupSummaryDto {
    private Long id;
    private String name;
    private String description;
    private String groupType;
    private String memberRole;       // ADMIN or MEMBER (current user's role)
    private long memberCount;
    private long unreadCount;
    private String latestMessagePreview;
    private String latestMessageSenderName;
    private LocalDateTime latestMessageAt;
    private LocalDateTime createdAt;

    public GroupSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGroupType() { return groupType; }
    public void setGroupType(String groupType) { this.groupType = groupType; }

    public String getMemberRole() { return memberRole; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }

    public long getMemberCount() { return memberCount; }
    public void setMemberCount(long memberCount) { this.memberCount = memberCount; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

    public String getLatestMessagePreview() { return latestMessagePreview; }
    public void setLatestMessagePreview(String latestMessagePreview) { this.latestMessagePreview = latestMessagePreview; }

    public String getLatestMessageSenderName() { return latestMessageSenderName; }
    public void setLatestMessageSenderName(String latestMessageSenderName) { this.latestMessageSenderName = latestMessageSenderName; }

    public LocalDateTime getLatestMessageAt() { return latestMessageAt; }
    public void setLatestMessageAt(LocalDateTime latestMessageAt) { this.latestMessageAt = latestMessageAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
