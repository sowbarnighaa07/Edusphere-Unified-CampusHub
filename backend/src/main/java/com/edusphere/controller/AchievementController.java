package com.edusphere.controller;

import com.edusphere.dto.achievement.AchievementDto;
import com.edusphere.dto.achievement.SubmitAchievementRequest;
import com.edusphere.dto.achievement.VerifyAchievementRequest;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.entity.AchievementStatus;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.AchievementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Endpoints
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/student/achievements", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AchievementDto>> submitAchievementMultipart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @ModelAttribute SubmitAchievementRequest request,
            @RequestPart(value = "certificate", required = false) MultipartFile certificate) {
        AchievementDto dto = achievementService.submitAchievement(userPrincipal.getId(), request, certificate);
        return ResponseEntity.ok(ApiResponse.success("Achievement submitted for faculty verification.", dto));
    }

    @PostMapping(value = "/student/achievements", consumes = {"application/json"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AchievementDto>> submitAchievementJson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SubmitAchievementRequest request) {
        AchievementDto dto = achievementService.submitAchievement(userPrincipal.getId(), request, null);
        return ResponseEntity.ok(ApiResponse.success("Achievement submitted for faculty verification.", dto));
    }

    @GetMapping("/student/achievements")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getMyAchievements(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AchievementDto> list = achievementService.getMyAchievements(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Faculty / Staff Verification Endpoints
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/staff/achievements")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getDepartmentAchievements(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) AchievementStatus status) {
        List<AchievementDto> list = achievementService.getDepartmentAchievements(
                userPrincipal.getId(), userPrincipal.getRole(), status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/staff/achievements/{id}/verify")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<AchievementDto>> verifyAchievement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody VerifyAchievementRequest request) {
        AchievementDto updated = achievementService.verifyAchievement(
                userPrincipal.getId(), userPrincipal.getRole(), id, request);
        return ResponseEntity.ok(ApiResponse.success(
                "Achievement status updated to " + request.getStatus() + ".", updated));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Campus-wide Verified Showcase (Authenticated users only)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/achievements/verified")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getVerifiedAchievements() {
        List<AchievementDto> list = achievementService.getVerifiedAchievements();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
