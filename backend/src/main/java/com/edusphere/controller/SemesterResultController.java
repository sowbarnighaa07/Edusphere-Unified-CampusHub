package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.result.*;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.SemesterResultService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/results")
@PreAuthorize("hasRole('ADMIN')")
public class SemesterResultController {

    private final SemesterResultService semesterResultService;

    public SemesterResultController(SemesterResultService semesterResultService) {
        this.semesterResultService = semesterResultService;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return xf != null ? xf.split(",")[0] : request.getRemoteAddr();
    }

    @GetMapping("/verify-data")
    public ResponseEntity<ApiResponse<SemesterAcademicVerificationDto>> verifyAcademicData(
            @RequestParam Long departmentId,
            @RequestParam Long sectionId,
            @RequestParam Integer semester,
            @RequestParam String academicYear) {
        SemesterAcademicVerificationDto dto = semesterResultService.verifyAcademicData(departmentId, sectionId, semester, academicYear);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/section")
    public ResponseEntity<ApiResponse<List<SemesterResultSummaryDto>>> getSectionResults(
            @RequestParam Long sectionId,
            @RequestParam Integer semester,
            @RequestParam String academicYear) {
        List<SemesterResultSummaryDto> list = semesterResultService.getSectionResults(sectionId, semester, academicYear);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<SemesterResultSummaryDto>>> generateSemesterResults(
            @Valid @RequestBody GenerateSemesterResultsRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        List<SemesterResultSummaryDto> results = semesterResultService.generateSemesterResults(
                userPrincipal.getId(), requestDto, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Semester results successfully generated from continuous assessments.", results));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<List<SemesterResultSummaryDto>>> verifySemesterResults(
            @Valid @RequestBody VerifySemesterResultsRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        List<SemesterResultSummaryDto> results = semesterResultService.verifySemesterResults(
                userPrincipal.getId(), requestDto, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Semester results verified and marked ready for publication.", results));
    }

    @PostMapping("/publish")
    public ResponseEntity<ApiResponse<List<SemesterResultSummaryDto>>> publishSemesterResults(
            @Valid @RequestBody PublishSemesterResultsRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        List<SemesterResultSummaryDto> results = semesterResultService.publishSemesterResults(
                userPrincipal.getId(), requestDto, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Semester results officially published. Results are now visible to students.", results));
    }

    @PostMapping("/transition")
    public ResponseEntity<ApiResponse<SemesterTransitionResultDto>> executeSemesterTransition(
            @Valid @RequestBody SemesterTransitionRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        SemesterTransitionResultDto result = semesterResultService.executeSemesterTransition(
                userPrincipal.getId(), requestDto, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Student cohort semester transition completed successfully.", result));
    }
}
