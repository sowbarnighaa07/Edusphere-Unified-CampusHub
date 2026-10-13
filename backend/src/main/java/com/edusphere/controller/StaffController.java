package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.staff.*;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.StaffTeachingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/staff")
@PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
public class StaffController {

    private final StaffTeachingService staffTeachingService;

    public StaffController(StaffTeachingService staffTeachingService) {
        this.staffTeachingService = staffTeachingService;
    }

    // ─── Step 1: My Classes ───────────────────────────────────────────────────

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<StaffClassSummaryDto>>> getAssignedClasses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StaffClassSummaryDto> classes = staffTeachingService.getStaffClasses(
                userPrincipal.getId(), userPrincipal.getRole());
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/classes/{teachingAssignmentId}/students")
    public ResponseEntity<ApiResponse<List<StaffClassStudentDto>>> getEnrolledStudents(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StaffClassStudentDto> students = staffTeachingService.getEnrolledStudentsForClass(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    // ─── Step 2: Classroom Details & Materials ────────────────────────────────

    @GetMapping("/classrooms/{teachingAssignmentId}")
    public ResponseEntity<ApiResponse<ClassroomDto>> getClassroomDetails(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ClassroomDto dto = staffTeachingService.getClassroomDetails(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/classrooms/{teachingAssignmentId}/materials")
    public ResponseEntity<ApiResponse<List<ClassroomMaterialDto>>> getMaterials(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ClassroomMaterialDto> materials = staffTeachingService.getMaterials(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @PostMapping("/classrooms/{teachingAssignmentId}/materials")
    public ResponseEntity<ApiResponse<ClassroomMaterialDto>> uploadMaterial(
            @PathVariable Long teachingAssignmentId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ClassroomMaterialDto dto = staffTeachingService.uploadMaterial(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId, title, description, file);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @DeleteMapping("/classrooms/materials/{materialId}")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(
            @PathVariable Long materialId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        staffTeachingService.deleteMaterial(userPrincipal.getId(), userPrincipal.getRole(), materialId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Step 3: Assignments ─────────────────────────────────────────────────

    @GetMapping("/assignments/{teachingAssignmentId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignments(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AssignmentDto> assignments = staffTeachingService.getAssignments(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @PostMapping(value = "/assignments", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<AssignmentDto>> createAssignment(
            @RequestParam("teachingAssignmentId") Long teachingAssignmentId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("deadline") String deadline,
            @RequestParam("maxMarks") Double maxMarks,
            @RequestParam(value = "file", required = false) MultipartFile attachmentFile,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CreateAssignmentRequest req = new CreateAssignmentRequest();
        req.setTeachingAssignmentId(teachingAssignmentId);
        req.setTitle(title);
        req.setDescription(description);
        req.setDeadline(deadline);
        req.setMaxMarks(maxMarks);
        AssignmentDto dto = staffTeachingService.createAssignment(
                userPrincipal.getId(), userPrincipal.getRole(), req, attachmentFile);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        staffTeachingService.deleteAssignment(userPrincipal.getId(), userPrincipal.getRole(), assignmentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Step 4: IAT & Attendance ─────────────────────────────────────────────

    @GetMapping("/marks/{teachingAssignmentId}")
    public ResponseEntity<ApiResponse<List<StudentAcademicRecordDto>>> getAcademicRecords(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StudentAcademicRecordDto> records = staffTeachingService.getAcademicRecordsForClass(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @PostMapping("/marks/batch")
    public ResponseEntity<ApiResponse<Void>> batchUpdateMarks(
            @Valid @RequestBody BatchMarkUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        staffTeachingService.batchUpdateMarks(userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.successMessage("Marks updated successfully."));
    }

    // ─── Step 5: Performance Analytics (Batch 4) ──────────────────────────────

    @GetMapping("/performance/{teachingAssignmentId}")
    public ResponseEntity<ApiResponse<StaffPerformanceOverviewDto>> getPerformanceAnalytics(
            @PathVariable Long teachingAssignmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StaffPerformanceOverviewDto overview = staffTeachingService.getPerformanceAnalyticsForClass(
                userPrincipal.getId(), userPrincipal.getRole(), teachingAssignmentId);
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    // ─── Step 6: Profile (Batch 5B) ───────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StaffProfileDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StaffProfileDto profile = staffTeachingService.getStaffProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StaffProfileDto>> updateProfile(
            @Valid @RequestBody UpdateStaffProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StaffProfileDto updated = staffTeachingService.updateStaffProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
