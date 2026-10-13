package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.ml.StudentPredictionResponseDto;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.MlPredictionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ml")
public class MlPredictionController {

    private final MlPredictionService mlPredictionService;

    public MlPredictionController(MlPredictionService mlPredictionService) {
        this.mlPredictionService = mlPredictionService;
    }

    /**
     * Phase 13: Authenticated student triggers semester performance prediction for their own profile.
     */
    @PostMapping("/predict")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentPredictionResponseDto>> predictMySemesterPerformance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        StudentPredictionResponseDto result = mlPredictionService.predictMySemesterPerformance(
                userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    /**
     * Phase 13: Authorized staff, HOD, or Admin triggers prediction for a specific student.
     */
    @PostMapping("/predict/{studentProfileId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentPredictionResponseDto>> predictStudentSemesterPerformance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long studentProfileId,
            HttpServletRequest request) {
        StudentPredictionResponseDto result = mlPredictionService.predictStudentSemesterPerformance(
                studentProfileId, userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}
