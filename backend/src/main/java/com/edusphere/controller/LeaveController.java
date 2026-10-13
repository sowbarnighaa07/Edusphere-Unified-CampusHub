package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.leave.ApplyLeaveRequest;
import com.edusphere.dto.leave.LeaveResponseDto;
import com.edusphere.dto.leave.StaffLeaveReviewRequest;
import com.edusphere.entity.LeaveStatus;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Endpoints (/api/student/leave)
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/student/leave", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> applyLeaveMultipart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @ModelAttribute ApplyLeaveRequest request,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment) {
        LeaveResponseDto result = leaveService.applyLeave(userPrincipal.getId(), request, attachment);
        return ResponseEntity.ok(ApiResponse.success("Leave application submitted successfully.", result));
    }

    @PostMapping(value = "/student/leave", consumes = {"application/json"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> applyLeaveJson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ApplyLeaveRequest request) {
        LeaveResponseDto result = leaveService.applyLeave(userPrincipal.getId(), request, null);
        return ResponseEntity.ok(ApiResponse.success("Leave application submitted successfully.", result));
    }

    @GetMapping("/student/leave")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>> getMyLeaves(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<LeaveResponseDto> leaves = leaveService.getMyLeaveRequests(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @DeleteMapping("/student/leave/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        leaveService.cancelLeave(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.successMessage("Leave application cancelled successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Staff Stage-1 Review Endpoints (/api/staff/leave)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/staff/leave")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>> getStaffAssignedLeaves(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) LeaveStatus status) {
        List<LeaveResponseDto> leaves = leaveService.getStaffAssignedLeaveRequests(
                userPrincipal.getId(), userPrincipal.getRole(), status);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @PutMapping("/staff/leave/{id}/review")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> reviewLeaveStage1(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody StaffLeaveReviewRequest reviewRequest) {
        LeaveResponseDto updated = leaveService.reviewLeaveStage1(
                userPrincipal.getId(), userPrincipal.getRole(), id, reviewRequest);
        return ResponseEntity.ok(ApiResponse.success(
                "Leave stage-1 review recorded (" + reviewRequest.getStatus() + ").", updated));
    }
}
