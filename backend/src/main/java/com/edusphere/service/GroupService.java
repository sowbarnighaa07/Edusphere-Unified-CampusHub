package com.edusphere.service;

import com.edusphere.dto.group.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private static final int MESSAGE_PAGE_SIZE = 100;

    private final CampusGroupRepository groupRepository;
    private final CampusGroupMemberRepository memberRepository;
    private final CampusGroupMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;

    public GroupService(CampusGroupRepository groupRepository,
                        CampusGroupMemberRepository memberRepository,
                        CampusGroupMessageRepository messageRepository,
                        UserRepository userRepository,
                        StudentProfileRepository studentProfileRepository,
                        StaffProfileRepository staffProfileRepository,
                        HodProfileRepository hodProfileRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Group list
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all active groups the authenticated user belongs to, with unread counts.
     */
    public List<GroupSummaryDto> getMyGroups(Long userId) {
        List<CampusGroup> groups = groupRepository.findGroupsByUserId(userId);
        List<GroupSummaryDto> result = new ArrayList<>();

        for (CampusGroup group : groups) {
            CampusGroupMember membership = memberRepository.findByGroupIdAndUserId(group.getId(), userId)
                    .orElse(null);
            if (membership == null) continue;

            GroupSummaryDto dto = new GroupSummaryDto();
            dto.setId(group.getId());
            dto.setName(group.getName());
            dto.setDescription(group.getDescription());
            dto.setGroupType(group.getGroupType().name());
            dto.setMemberRole(membership.getMemberRole().name());
            dto.setCreatedAt(group.getCreatedAt());

            long memberCount = memberRepository.countByGroupId(group.getId());
            dto.setMemberCount(memberCount);

            long unread = messageRepository.countUnreadMessages(
                    group.getId(), userId, membership.getLastReadAt());
            dto.setUnreadCount(unread);

            // Latest message preview
            List<CampusGroupMessage> latest = messageRepository.findLatestByGroupId(
                    group.getId(), PageRequest.of(0, 1));
            if (!latest.isEmpty()) {
                CampusGroupMessage latestMsg = latest.get(0);
                String preview = latestMsg.getContent();
                if (preview != null && preview.length() > 60) {
                    preview = preview.substring(0, 57) + "...";
                }
                dto.setLatestMessagePreview(preview);
                dto.setLatestMessageAt(latestMsg.getCreatedAt());
                dto.setLatestMessageSenderName(resolveDisplayName(latestMsg.getSender()));
            }

            result.add(dto);
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Group detail
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns full group details. User must be a member.
     */
    public GroupDetailDto getGroupDetail(Long groupId, Long userId) {
        CampusGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        CampusGroupMember membership = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedAccessException("You are not a member of this group."));

        GroupDetailDto dto = new GroupDetailDto();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setGroupType(group.getGroupType().name());
        dto.setCurrentUserRole(membership.getMemberRole().name());
        dto.setCreatedByUserId(group.getCreatedBy().getId());
        dto.setCreatedByName(resolveDisplayName(group.getCreatedBy()));
        dto.setCreatedAt(group.getCreatedAt());

        List<CampusGroupMember> members = memberRepository.findByGroupIdOrderByMemberRoleAscJoinedAtAsc(groupId);
        dto.setMemberCount(members.size());
        dto.setMembers(members.stream().map(this::mapToMemberDto).collect(Collectors.toList()));

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Group creation
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Only STAFF, HOD, ADMIN can create groups.
     */
    @Transactional
    public GroupDetailDto createGroup(Long userId, Role userRole, CreateGroupRequest request) {
        if (userRole == Role.STUDENT) {
            throw new UnauthorizedAccessException("Students are not permitted to create groups.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Group name is required.");
        }
        if (request.getGroupType() == null || request.getGroupType().isBlank()) {
            throw new BadRequestException("Group type is required.");
        }

        GroupType type;
        try {
            type = GroupType.valueOf(request.getGroupType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid group type: " + request.getGroupType());
        }

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CampusGroup group = new CampusGroup();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        group.setGroupType(type);
        group.setCreatedBy(creator);
        group.setIsActive(true);

        group = groupRepository.save(group);

        // Creator automatically becomes GROUP_ADMIN
        CampusGroupMember adminMembership = new CampusGroupMember();
        adminMembership.setGroup(group);
        adminMembership.setUser(creator);
        adminMembership.setMemberRole(GroupMemberRole.ADMIN);
        adminMembership.setLastReadAt(LocalDateTime.now());
        memberRepository.save(adminMembership);

        return getGroupDetail(group.getId(), userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Members
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a member. Caller must be a GROUP_ADMIN.
     */
    @Transactional
    public GroupMemberDto addMember(Long groupId, Long callerUserId, Role callerRole, AddMemberRequest request) {
        CampusGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        // Enforce: caller must be a GROUP_ADMIN (unless ADMIN role)
        if (callerRole != Role.ADMIN) {
            CampusGroupMember callerMembership = memberRepository.findByGroupIdAndUserId(groupId, callerUserId)
                    .orElseThrow(() -> new UnauthorizedAccessException("You are not a member of this group."));
            if (callerMembership.getMemberRole() != GroupMemberRole.ADMIN) {
                throw new UnauthorizedAccessException("Only group administrators can add members.");
            }
        }

        // Resolve the target user
        User targetUser = resolveTargetUser(request);

        // Prevent duplicate membership
        if (memberRepository.existsByGroupIdAndUserId(groupId, targetUser.getId())) {
            throw new BadRequestException("User is already a member of this group.");
        }

        GroupMemberRole assignedRole = GroupMemberRole.MEMBER;
        if (request.getMemberRole() != null && !request.getMemberRole().isBlank()) {
            try {
                assignedRole = GroupMemberRole.valueOf(request.getMemberRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid member role: " + request.getMemberRole());
            }
        }

        CampusGroupMember member = new CampusGroupMember();
        member.setGroup(group);
        member.setUser(targetUser);
        member.setMemberRole(assignedRole);
        member.setLastReadAt(null);  // null = consider all existing messages as unread
        memberRepository.save(member);

        return mapToMemberDto(member);
    }

    /**
     * Remove a member. Caller must be GROUP_ADMIN or ADMIN role.
     */
    @Transactional
    public void removeMember(Long groupId, Long targetUserId, Long callerUserId, Role callerRole) {
        // Verify group exists
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        // Enforce: caller must be GROUP_ADMIN or ADMIN
        if (callerRole != Role.ADMIN) {
            CampusGroupMember callerMembership = memberRepository.findByGroupIdAndUserId(groupId, callerUserId)
                    .orElseThrow(() -> new UnauthorizedAccessException("You are not a member of this group."));
            if (callerMembership.getMemberRole() != GroupMemberRole.ADMIN) {
                throw new UnauthorizedAccessException("Only group administrators can remove members.");
            }
        }

        // Target membership must exist
        if (!memberRepository.existsByGroupIdAndUserId(groupId, targetUserId)) {
            throw new ResourceNotFoundException("Member not found in this group.");
        }

        memberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);
    }

    /**
     * A student can leave a group they are in.
     */
    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new BadRequestException("You are not a member of this group.");
        }

        memberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Messages
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns message history for a group. User must be a member.
     * After fetching, marks all messages as read for this user.
     */
    @Transactional
    public List<GroupMessageDto> getMessages(Long groupId, Long userId) {
        // Membership check
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        CampusGroupMember membership = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedAccessException("You are not a member of this group."));

        List<CampusGroupMessage> messages = messageRepository.findByGroupIdOrderByCreatedAtDesc(
                groupId, PageRequest.of(0, MESSAGE_PAGE_SIZE));

        // Mark as read by updating lastReadAt
        membership.setLastReadAt(LocalDateTime.now());
        memberRepository.save(membership);

        // Reverse to chronological order for display
        List<GroupMessageDto> result = new ArrayList<>();
        for (int i = messages.size() - 1; i >= 0; i--) {
            result.add(mapToMessageDto(messages.get(i)));
        }
        return result;
    }

    /**
     * Send a message. Sender must be a member.
     */
    @Transactional
    public GroupMessageDto sendMessage(Long groupId, Long userId, SendMessageRequest request) {
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new BadRequestException("Message content cannot be empty.");
        }

        CampusGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        // Membership check
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new UnauthorizedAccessException("You are not a member of this group.");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CampusGroupMessage message = new CampusGroupMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(request.getContent().trim());
        message = messageRepository.save(message);

        // Update sender's own lastReadAt so they don't see unread for their own message
        memberRepository.findByGroupIdAndUserId(groupId, userId).ifPresent(m -> {
            m.setLastReadAt(LocalDateTime.now());
            memberRepository.save(m);
        });

        return mapToMessageDto(message);
    }

    /**
     * Mark all messages in a group as read for the current user.
     */
    @Transactional
    public void markAsRead(Long groupId, Long userId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));

        memberRepository.findByGroupIdAndUserId(groupId, userId).ifPresent(m -> {
            m.setLastReadAt(LocalDateTime.now());
            memberRepository.save(m);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student search
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Search a student by register number. Used by staff to find students to add.
     */
    public StudentSearchResultDto searchStudentByRegisterNumber(String registerNumber, Long callerUserId, Role callerRole) {
        if (callerRole == Role.STUDENT) {
            throw new UnauthorizedAccessException("Students cannot search for other students.");
        }

        StudentProfile profile = studentProfileRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with register number: " + registerNumber));

        StudentSearchResultDto dto = new StudentSearchResultDto();
        dto.setUserId(profile.getUser().getId());
        dto.setStudentProfileId(profile.getId());
        dto.setFullName(profile.getFullName());
        dto.setRegisterNumber(profile.getRegisterNumber());
        dto.setDepartmentName(profile.getDepartment().getName());
        dto.setDepartmentCode(profile.getDepartment().getCode());
        dto.setSectionName(profile.getSection().getName());
        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private User resolveTargetUser(AddMemberRequest request) {
        if (request.getUserId() != null) {
            return userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        }
        if (request.getRegisterNumber() != null && !request.getRegisterNumber().isBlank()) {
            StudentProfile sp = studentProfileRepository.findByRegisterNumber(request.getRegisterNumber())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with register number: " + request.getRegisterNumber()));
            return sp.getUser();
        }
        throw new BadRequestException("Either userId or registerNumber must be provided.");
    }

    private String resolveDisplayName(User user) {
        switch (user.getRole()) {
            case STUDENT: {
                Optional<StudentProfile> sp = studentProfileRepository.findByUserId(user.getId());
                return sp.map(StudentProfile::getFullName).orElse(user.getEmail());
            }
            case STAFF: {
                Optional<StaffProfile> sp = staffProfileRepository.findByUserId(user.getId());
                return sp.map(StaffProfile::getFullName).orElse(user.getEmail());
            }
            case HOD: {
                Optional<HodProfile> hp = hodProfileRepository.findByUserId(user.getId());
                return hp.map(HodProfile::getFullName).orElse(user.getEmail());
            }
            default:
                return user.getEmail();
        }
    }

    private GroupMemberDto mapToMemberDto(CampusGroupMember m) {
        GroupMemberDto dto = new GroupMemberDto();
        dto.setUserId(m.getUser().getId());
        dto.setMemberRole(m.getMemberRole().name());
        dto.setRole(m.getUser().getRole().name());
        dto.setJoinedAt(m.getJoinedAt());

        switch (m.getUser().getRole()) {
            case STUDENT: {
                studentProfileRepository.findByUserId(m.getUser().getId()).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setRegisterNumber(sp.getRegisterNumber());
                    dto.setDepartmentName(sp.getDepartment().getName());
                });
                break;
            }
            case STAFF: {
                staffProfileRepository.findByUserId(m.getUser().getId()).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setEmployeeId(sp.getEmployeeId());
                    dto.setDepartmentName(sp.getDepartment().getName());
                });
                break;
            }
            case HOD: {
                hodProfileRepository.findByUserId(m.getUser().getId()).ifPresent(hp -> {
                    dto.setFullName(hp.getFullName());
                    dto.setEmployeeId(hp.getEmployeeId());
                    dto.setDepartmentName(hp.getDepartment().getName());
                });
                break;
            }
            default:
                dto.setFullName(m.getUser().getEmail());
        }
        return dto;
    }

    private GroupMessageDto mapToMessageDto(CampusGroupMessage m) {
        GroupMessageDto dto = new GroupMessageDto();
        dto.setId(m.getId());
        dto.setGroupId(m.getGroup().getId());
        dto.setSenderUserId(m.getSender().getId());
        dto.setSenderRole(m.getSender().getRole().name());
        dto.setSenderName(resolveDisplayName(m.getSender()));
        dto.setContent(m.getContent());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
