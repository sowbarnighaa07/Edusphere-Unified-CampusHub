package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.student.*;
import com.edusphere.entity.Assignment;
import com.edusphere.entity.AssignmentSubmission;
import com.edusphere.entity.ClassroomMaterial;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.FileStorageService;
import com.edusphere.service.StudentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;
    private final FileStorageService fileStorageService;

    public StudentController(StudentService studentService, FileStorageService fileStorageService) {
        this.studentService = studentService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentProfileDto profile = studentService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateStudentProfileRequest request) {
        StudentProfileDto updated = studentService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/academic/current")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAcademicOverviewDto>> getCurrentAcademicDetails(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentAcademicOverviewDto overview = studentService.getCurrentAcademicOverview(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    /**
     * Phase 12: Authenticated student views their own full multi-semester academic history.
     */
    @GetMapping("/academic/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAcademicHistoryDto>> getMyAcademicHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentAcademicHistoryDto history = studentService.getMyAcademicHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Phase 12: Authorized staff, HOD, or admin views a specific student's full academic history.
     * Backend enforces: ADMIN = all, HOD = own department, STAFF = own teaching sections, STUDENT = own only.
     */
    @GetMapping("/{studentProfileId}/academic/history")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentAcademicHistoryDto>> getStudentAcademicHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long studentProfileId) {
        StudentAcademicHistoryDto history = studentService.getStudentAcademicHistory(
                studentProfileId, userPrincipal.getId(), userPrincipal.getRole());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Virtual Classrooms (Batch 1)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/classrooms")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentClassroomDto>>> getStudentClassrooms(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StudentClassroomDto> classrooms = studentService.getStudentClassrooms(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(classrooms));
    }

    @GetMapping("/classrooms/{classroomId}/materials")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentClassroomMaterialDto>>> getStudentClassroomMaterials(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long classroomId) {
        List<StudentClassroomMaterialDto> materials = studentService.getStudentClassroomMaterials(userPrincipal.getId(), classroomId);
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @GetMapping("/classrooms/{classroomId}/materials/{materialId}/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadMaterial(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long classroomId,
            @PathVariable Long materialId) {
        ClassroomMaterial material = studentService.getMaterialForStudentDownload(userPrincipal.getId(), classroomId, materialId);
        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(material.getFilePath());
        } catch (Exception e) {
            String content = "EduSphere Virtual Classroom Resource\n"
                    + "Subject Material: " + material.getTitle() + "\n"
                    + "Description: " + (material.getDescription() != null ? material.getDescription() : "") + "\n"
                    + "Filename: " + material.getFileName() + "\n";
            resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + material.getFileName() + "\"")
                .body(resource);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student Coursework Assignments (Batch 2)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentAssignmentDto>>> getStudentAssignments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StudentAssignmentDto> assignments = studentService.getStudentAssignments(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAssignmentDto>> getStudentAssignment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long assignmentId) {
        StudentAssignmentDto assignment = studentService.getStudentAssignment(userPrincipal.getId(), assignmentId);
        return ResponseEntity.ok(ApiResponse.success(assignment));
    }

    @GetMapping("/assignments/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAssignmentSubmissionDto>> getStudentSubmission(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long assignmentId) {
        StudentAssignmentSubmissionDto submission = studentService.getStudentSubmission(userPrincipal.getId(), assignmentId);
        return ResponseEntity.ok(ApiResponse.success(submission));
    }

    @PostMapping(value = "/assignments/{assignmentId}/submit", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAssignmentSubmissionDto>> submitAssignment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long assignmentId,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        StudentAssignmentSubmissionDto submission = studentService.submitAssignment(
                userPrincipal.getId(), assignmentId, remarks, file);
        return ResponseEntity.ok(ApiResponse.success("Assignment submitted successfully", submission));
    }

    @GetMapping("/assignments/{assignmentId}/attachment/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadAssignmentAttachment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long assignmentId) {
        Assignment assignment = studentService.getAssignmentForStudentAttachmentDownload(userPrincipal.getId(), assignmentId);
        if (assignment.getAttachmentPath() == null || assignment.getAttachmentPath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String fileName = assignment.getAttachmentPath();
        fileName = fileName.substring(fileName.lastIndexOf('/') + 1);

        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(assignment.getAttachmentPath());
        } catch (Exception e) {
            String content = "EduSphere Coursework Assignment Attachment\n"
                    + "Assignment Title: " + assignment.getTitle() + "\n"
                    + "Description: " + (assignment.getDescription() != null ? assignment.getDescription() : "") + "\n"
                    + "Deadline: " + assignment.getDeadline() + "\n";
            resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @GetMapping("/assignments/{assignmentId}/submission/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadStudentSubmission(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long assignmentId) {
        AssignmentSubmission submission = studentService.getStudentSubmissionForDownload(userPrincipal.getId(), assignmentId);
        if (submission.getFilePath() == null || submission.getFilePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String fileName = submission.getFileName() != null && !submission.getFileName().isBlank()
                ? submission.getFileName()
                : "submission_" + assignmentId + ".pdf";

        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(submission.getFilePath());
        } catch (Exception e) {
            String content = "EduSphere Assignment Submission Document\n"
                    + "Student: " + submission.getStudent().getFullName() + " (" + submission.getStudent().getRegisterNumber() + ")\n"
                    + "Assignment: " + submission.getAssignment().getTitle() + "\n"
                    + "Submission Date: " + submission.getSubmissionDate() + "\n"
                    + "Remarks: " + (submission.getRemarks() != null ? submission.getRemarks() : "") + "\n";
            resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    // ─── Step 6: Student Digital Portfolio (Batch 5A) ──────────────────────────

    @GetMapping("/portfolio")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentPortfolioDto>> getPortfolio(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentPortfolioDto portfolio = studentService.getPortfolio(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(portfolio));
    }

    @PutMapping("/portfolio")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentPortfolioDto>> updatePortfolio(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateStudentPortfolioRequest request) {
        StudentPortfolioDto updated = studentService.updatePortfolio(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Portfolio updated successfully.", updated));
    }
}
