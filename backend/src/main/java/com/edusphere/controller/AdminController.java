package com.edusphere.controller;

import com.edusphere.dto.admin.*;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.entity.AuditLog;
import com.edusphere.entity.Role;
import com.edusphere.entity.User;
import com.edusphere.entity.UserStatus;
import com.edusphere.repository.UserRepository;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;
    private final DepartmentService departmentService;
    private final SubjectService subjectService;
    private final TeachingAssignmentService teachingAssignmentService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService,
                           AuditLogService auditLogService,
                           DepartmentService departmentService,
                           SubjectService subjectService,
                           TeachingAssignmentService teachingAssignmentService,
                           UserRepository userRepository) {
        this.adminService = adminService;
        this.auditLogService = auditLogService;
        this.departmentService = departmentService;
        this.subjectService = subjectService;
        this.teachingAssignmentService = teachingAssignmentService;
        this.userRepository = userRepository;
    }

    private User getAdminUser(UserPrincipal userPrincipal) {
        if (userPrincipal == null) return null;
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    // --- REGISTRATIONS ---

    @GetMapping("/registrations/pending")
    public ResponseEntity<ApiResponse<List<RegistrationDetailDto>>> getPendingRegistrations() {
        List<RegistrationDetailDto> registrations = adminService.getPendingRegistrations();
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @PutMapping("/registrations/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRegistration(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        adminService.approveRegistration(id, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Student registration approved successfully. Account activated."));
    }

    @PutMapping("/registrations/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRegistration(
            @PathVariable Long id,
            @RequestBody(required = false) RegistrationDecisionRequest decisionRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String remarks = decisionRequest != null ? decisionRequest.getRemarks() : null;
        adminService.rejectRegistration(id, remarks, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Student registration rejected."));
    }

    // --- USER MANAGEMENT ---

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserManagementDto>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status) {
        List<UserManagementDto> users = adminService.getAllUsers(role, status);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest statusRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        adminService.updateUserStatus(id, statusRequest.getStatus(), getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("User account status updated to " + statusRequest.getStatus()));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<UserManagementDto>> createStaff(
            @Valid @RequestBody CreateStaffRequest staffRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        UserManagementDto result = adminService.createStaff(staffRequest, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Faculty account created successfully.", result));
    }

    @PostMapping("/hod")
    public ResponseEntity<ApiResponse<UserManagementDto>> createHod(
            @Valid @RequestBody CreateHodRequest hodRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        UserManagementDto result = adminService.createHod(hodRequest, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("HOD account created successfully.", result));
    }

    // --- DEPARTMENTS ---

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentDetailDto>>> getAllDepartments() {
        List<DepartmentDetailDto> list = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<DepartmentDetailDto>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        DepartmentDetailDto result = departmentService.createDepartment(requestDto, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Department created successfully.", result));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        departmentService.deleteDepartment(id, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Department deleted successfully."));
    }

    // --- SECTIONS ---

    @GetMapping("/sections")
    public ResponseEntity<ApiResponse<List<SectionDetailDto>>> getSections(
            @RequestParam(required = false) Long departmentId) {
        List<SectionDetailDto> list = departmentService.getSections(departmentId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/sections")
    public ResponseEntity<ApiResponse<SectionDetailDto>> createSection(
            @Valid @RequestBody CreateSectionRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        SectionDetailDto result = departmentService.createSection(requestDto, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Section created successfully.", result));
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        departmentService.deleteSection(id, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Section deleted successfully."));
    }

    // --- SUBJECTS ---

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDetailDto>>> getSubjects(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer semester) {
        List<SubjectDetailDto> list = subjectService.getSubjects(departmentId, semester);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<SubjectDetailDto>> createSubject(
            @Valid @RequestBody CreateSubjectRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        SubjectDetailDto result = subjectService.createSubject(requestDto, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Curriculum subject created successfully.", result));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        subjectService.deleteSubject(id, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Subject deleted successfully."));
    }

    // --- TEACHING ASSIGNMENTS ---

    @GetMapping("/teaching-assignments")
    public ResponseEntity<ApiResponse<List<TeachingAssignmentDetailDto>>> getTeachingAssignments(
            @RequestParam(required = false) Long staffId) {
        List<TeachingAssignmentDetailDto> list = teachingAssignmentService.getTeachingAssignments(staffId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/teaching-assignments")
    public ResponseEntity<ApiResponse<TeachingAssignmentDetailDto>> createTeachingAssignment(
            @Valid @RequestBody CreateTeachingAssignmentRequest requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        TeachingAssignmentDetailDto result = teachingAssignmentService.createTeachingAssignment(requestDto, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.success("Teaching assignment created and virtual classroom provisioned.", result));
    }

    @DeleteMapping("/teaching-assignments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTeachingAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        teachingAssignmentService.deleteTeachingAssignment(id, getAdminUser(userPrincipal), getClientIp(request));
        return ResponseEntity.ok(ApiResponse.successMessage("Teaching assignment deleted successfully."));
    }

    // --- ADMIN PROFILE (Batch 5D) ---

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AdminProfileDto>> getAdminProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AdminProfileDto profile = adminService.getAdminProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
