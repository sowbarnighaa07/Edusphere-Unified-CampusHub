package com.edusphere.controller;

import com.edusphere.dto.ai.AcademicGuidanceResponse;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.AiAcademicGuidanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AiAcademicGuidanceController {

    private final AiAcademicGuidanceService aiAcademicGuidanceService;

    public AiAcademicGuidanceController(AiAcademicGuidanceService aiAcademicGuidanceService) {
        this.aiAcademicGuidanceService = aiAcademicGuidanceService;
    }

    /**
     * Phase 14: Authenticated student requests AI academic guidance based on their own MySQL records.
     */
    @PostMapping("/academic-guidance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AcademicGuidanceResponse>> getMyAcademicGuidance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        AcademicGuidanceResponse guidance = aiAcademicGuidanceService.getMyAcademicGuidance(
                userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(guidance.getMessage(), guidance));
    }

    /**
     * Phase 14: Authorized staff, HOD, or Admin views academic guidance for a specific student.
     */
    @PostMapping("/academic-guidance/{studentProfileId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicGuidanceResponse>> getStudentAcademicGuidance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long studentProfileId,
            HttpServletRequest request) {
        AcademicGuidanceResponse guidance = aiAcademicGuidanceService.getStudentAcademicGuidance(
                studentProfileId, userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success(guidance.getMessage(), guidance));
    }
}
