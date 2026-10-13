package com.edusphere.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "campus_group_members",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_group_user",
        columnNames = {"group_id", "user_id"}
    )
)
@EntityListeners(AuditingEntityListener.class)
public class CampusGroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private CampusGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private GroupMemberRole memberRole = GroupMemberRole.MEMBER;

    /**
     * Tracks when this member last read messages in this group.
     * Unread count = messages created after lastReadAt by other senders.
     */
    private LocalDateTime lastReadAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    public CampusGroupMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CampusGroup getGroup() { return group; }
    public void setGroup(CampusGroup group) { this.group = group; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public GroupMemberRole getMemberRole() { return memberRole; }
    public void setMemberRole(GroupMemberRole memberRole) { this.memberRole = memberRole; }

    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(LocalDateTime lastReadAt) { this.lastReadAt = lastReadAt; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
