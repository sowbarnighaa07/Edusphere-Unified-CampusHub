package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.group.*;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // ─── Group List ────────────────────────────────────────────────────────────

    /**
     * GET /api/groups
     * Returns all active groups the authenticated user belongs to (with unread counts).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<GroupSummaryDto>>> getMyGroups(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<GroupSummaryDto> groups = groupService.getMyGroups(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    // ─── Group Detail ──────────────────────────────────────────────────────────

    /**
     * GET /api/groups/{groupId}
     * Returns group details. User must be a member.
     */
    @GetMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<GroupDetailDto>> getGroupDetail(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId) {
        GroupDetailDto detail = groupService.getGroupDetail(groupId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    // ─── Create Group ──────────────────────────────────────────────────────────

    /**
     * POST /api/groups
     * Create a new group. STAFF, HOD, ADMIN only.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<GroupDetailDto>> createGroup(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateGroupRequest request) {
        GroupDetailDto created = groupService.createGroup(
                userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success("Group created successfully.", created));
    }

    // ─── Members ───────────────────────────────────────────────────────────────

    /**
     * POST /api/groups/{groupId}/members
     * Add a member to the group. Caller must be a GROUP_ADMIN (or ADMIN role).
     */
    @PostMapping("/{groupId}/members")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<GroupMemberDto>> addMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId,
            @RequestBody AddMemberRequest request) {
        GroupMemberDto member = groupService.addMember(
                groupId, userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success("Member added successfully.", member));
    }

    /**
     * DELETE /api/groups/{groupId}/members/{userId}
     * Remove a member. Caller must be a GROUP_ADMIN (or ADMIN role).
     */
    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        groupService.removeMember(groupId, userId, userPrincipal.getId(), userPrincipal.getRole());
        return ResponseEntity.ok(ApiResponse.successMessage("Member removed."));
    }

    /**
     * DELETE /api/groups/{groupId}/leave
     * Leave a group. Any member (including student).
     */
    @DeleteMapping("/{groupId}/leave")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId) {
        groupService.leaveGroup(groupId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.successMessage("You have left the group."));
    }

    // ─── Messages ──────────────────────────────────────────────────────────────

    /**
     * GET /api/groups/{groupId}/messages
     * Fetch message history. User must be a member. Also marks messages as read.
     */
    @GetMapping("/{groupId}/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<GroupMessageDto>>> getMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId) {
        List<GroupMessageDto> messages = groupService.getMessages(groupId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    /**
     * POST /api/groups/{groupId}/messages
     * Send a message. User must be a member.
     */
    @PostMapping("/{groupId}/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<GroupMessageDto>> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId,
            @RequestBody SendMessageRequest request) {
        GroupMessageDto message = groupService.sendMessage(groupId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Message sent.", message));
    }

    /**
     * PUT /api/groups/{groupId}/read
     * Explicitly mark all messages as read for the current user.
     */
    @PutMapping("/{groupId}/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long groupId) {
        groupService.markAsRead(groupId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.successMessage("Marked as read."));
    }

    // ─── Student Search ────────────────────────────────────────────────────────

    /**
     * GET /api/groups/students/search?registerNumber=CSE2026001
     * Search a student by register number to add to a group. STAFF, HOD, ADMIN only.
     */
    @GetMapping("/students/search")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentSearchResultDto>> searchStudent(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String registerNumber) {
        StudentSearchResultDto result = groupService.searchStudentByRegisterNumber(
                registerNumber, userPrincipal.getId(), userPrincipal.getRole());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
