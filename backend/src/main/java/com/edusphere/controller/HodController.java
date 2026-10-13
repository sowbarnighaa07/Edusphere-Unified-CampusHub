package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.hod.*;
import com.edusphere.entity.LeaveStatus;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.HodService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hod")
@PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
public class HodController {

    private final HodService hodService;

    public HodController(HodService hodService) {
        this.hodService = hodService;
    }

    /**
     * 1. Department Overview & Metrics
     */
    @GetMapping("/department")
    public ResponseEntity<ApiResponse<HodDepartmentOverviewDto>> getDepartmentOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long departmentId) {
        HodDepartmentOverviewDto dto = hodService.getDepartmentOverview(
                userPrincipal.getId(), userPrincipal.getRole(), departmentId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 2. Department Student Directory & Academic Monitoring
     */
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<HodStudentDto>>> getDepartmentStudents(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Integer enrollmentYear,
            @RequestParam(required = false) Long departmentId) {
        List<HodStudentDto> students = hodService.getDepartmentStudents(
                userPrincipal.getId(), userPrincipal.getRole(), sectionId, enrollmentYear, departmentId);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    /**
     * 3. Faculty Workload & Teaching Allocations
     */
    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<HodFacultyDto>>> getDepartmentFaculty(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long departmentId) {
        List<HodFacultyDto> faculty = hodService.getDepartmentFaculty(
                userPrincipal.getId(), userPrincipal.getRole(), departmentId);
        return ResponseEntity.ok(ApiResponse.success(faculty));
    }

    /**
     * 4. Department-wide Attendance Analytics & Defaulters List
     */
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<HodAttendanceAnalyticsDto>> getAttendanceAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Long departmentId) {
        HodAttendanceAnalyticsDto analytics = hodService.getAttendanceAnalytics(
                userPrincipal.getId(), userPrincipal.getRole(), semester, departmentId);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    /**
     * 5. Department Student Leave Requests
     */
    @GetMapping("/leave")
    public ResponseEntity<ApiResponse<List<HodLeaveReviewDto>>> getDepartmentLeaveRequests(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) Long departmentId) {
        List<HodLeaveReviewDto> leaves = hodService.getDepartmentLeaveRequests(
                userPrincipal.getId(), userPrincipal.getRole(), status, departmentId);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    /**
     * 6. HOD Final Leave Decision (APPROVE / REJECT)
     */
    @PutMapping("/leave/{id}/decision")
    public ResponseEntity<ApiResponse<HodLeaveReviewDto>> decideLeaveRequest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody HodLeaveDecisionRequest decision) {
        HodLeaveReviewDto updated = hodService.decideLeaveRequest(
                userPrincipal.getId(), userPrincipal.getRole(), id, decision);
        return ResponseEntity.ok(ApiResponse.success(
                "Leave request " + decision.getStatus().name().toLowerCase() + " successfully.", updated));
    }

    /**
     * 7. HOD Profile (Batch 5C)
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<HodProfileDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        HodProfileDto profile = hodService.getHodProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<HodProfileDto>> updateProfile(
            @Valid @RequestBody UpdateHodProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        HodProfileDto updated = hodService.updateHodProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /**
     * 8. HOD Performance Analytics (Batch 5E)
     */
    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<HodPerformanceOverviewDto>> getDepartmentPerformance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long departmentId) {
        HodPerformanceOverviewDto dto = hodService.getDepartmentPerformance(
                userPrincipal.getId(), userPrincipal.getRole(), departmentId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 9. HOD Department Reports (Batch 5F)
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<HodReportsSummaryDto>> getDepartmentReports(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long departmentId) {
        HodReportsSummaryDto dto = hodService.getDepartmentReports(
                userPrincipal.getId(), userPrincipal.getRole(), departmentId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
