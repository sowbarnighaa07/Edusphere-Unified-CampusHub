package com.edusphere.service;

import com.edusphere.dto.admin.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AdminService(UserRepository userRepository,
                        StudentProfileRepository studentProfileRepository,
                        StaffProfileRepository staffProfileRepository,
                        HodProfileRepository hodProfileRepository,
                        DepartmentRepository departmentRepository,
                        SubjectRepository subjectRepository,
                        PasswordEncoder passwordEncoder,
                        AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<RegistrationDetailDto> getPendingRegistrations() {
        List<User> pendingUsers = userRepository.findByRoleAndStatus(Role.STUDENT, UserStatus.PENDING);
        List<RegistrationDetailDto> result = new ArrayList<>();

        for (User u : pendingUsers) {
            studentProfileRepository.findByUserId(u.getId()).ifPresent(sp -> {
                RegistrationDetailDto dto = new RegistrationDetailDto();
                dto.setId(sp.getId());
                dto.setUserId(u.getId());
                dto.setEmail(u.getEmail());
                dto.setFullName(sp.getFullName());
                dto.setRegisterNumber(sp.getRegisterNumber());
                dto.setDepartmentId(sp.getDepartment().getId());
                dto.setDepartmentName(sp.getDepartment().getName());
                dto.setDepartmentCode(sp.getDepartment().getCode());
                dto.setSectionId(sp.getSection().getId());
                dto.setSectionName(sp.getSection().getName());
                dto.setEnrollmentYear(sp.getEnrollmentYear());
                dto.setExpectedGraduationYear(sp.getExpectedGraduationYear());
                dto.setStatus(u.getStatus());
                dto.setSubmittedAt(sp.getCreatedAt());
                result.add(dto);
            });
        }
        return result;
    }

    @Transactional
    public void approveRegistration(Long studentProfileId, User adminUser, String ipAddress) {
        StudentProfile profile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        User user = profile.getUser();
        if (user.getStatus() != UserStatus.PENDING) {
            throw new BadRequestException("Student registration is not in PENDING state (Current status: " + user.getStatus() + ")");
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "REGISTRATION_APPROVED",
                "StudentProfile",
                profile.getId().toString(),
                "Approved registration for student " + profile.getFullName() + " (" + profile.getRegisterNumber() + ")",
                ipAddress
        );
    }

    @Transactional
    public void rejectRegistration(Long studentProfileId, String remarks, User adminUser, String ipAddress) {
        StudentProfile profile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        User user = profile.getUser();
        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "REGISTRATION_REJECTED",
                "StudentProfile",
                profile.getId().toString(),
                "Rejected registration for student " + profile.getFullName() + ". Reason: " + (remarks != null ? remarks : "None specified"),
                ipAddress
        );
    }

    @Transactional(readOnly = true)
    public List<UserManagementDto> getAllUsers(Role roleFilter, UserStatus statusFilter) {
        List<User> users;
        if (roleFilter != null && statusFilter != null) {
            users = userRepository.findByRoleAndStatus(roleFilter, statusFilter);
        } else if (roleFilter != null) {
            users = userRepository.findByRole(roleFilter);
        } else if (statusFilter != null) {
            users = userRepository.findByStatus(statusFilter);
        } else {
            users = userRepository.findAll();
        }

        List<UserManagementDto> result = new ArrayList<>();
        for (User u : users) {
            UserManagementDto dto = new UserManagementDto();
            dto.setId(u.getId());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setStatus(u.getStatus());
            dto.setCreatedAt(u.getCreatedAt());

            switch (u.getRole()) {
                case STUDENT -> studentProfileRepository.findByUserId(u.getId()).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setIdentifier(sp.getRegisterNumber());
                    dto.setDepartmentName(sp.getDepartment().getName());
                    dto.setDepartmentCode(sp.getDepartment().getCode());
                });
                case STAFF -> staffProfileRepository.findByUserId(u.getId()).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setIdentifier(sp.getEmployeeId());
                    dto.setDepartmentName(sp.getDepartment().getName());
                    dto.setDepartmentCode(sp.getDepartment().getCode());
                    dto.setDesignation(sp.getDesignation());
                });
                case HOD -> hodProfileRepository.findByUserId(u.getId()).ifPresent(hp -> {
                    dto.setFullName(hp.getFullName());
                    dto.setIdentifier(hp.getEmployeeId());
                    dto.setDepartmentName(hp.getDepartment().getName());
                    dto.setDepartmentCode(hp.getDepartment().getCode());
                    dto.setDesignation(hp.getDesignation());
                });
                case ADMIN -> {
                    dto.setFullName("System Administrator");
                    dto.setIdentifier("ADMIN-ROOT");
                    dto.setDesignation("System Governance");
                }
            }
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus newStatus, User adminUser, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ADMIN && newStatus != UserStatus.ACTIVE) {
            throw new BadRequestException("Administrator account cannot be deactivated");
        }

        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        userRepository.save(user);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "USER_STATUS_UPDATED",
                "User",
                userId.toString(),
                "Changed status of user " + user.getEmail() + " from " + oldStatus + " to " + newStatus,
                ipAddress
        );
    }

    @Transactional
    public UserManagementDto createStaff(CreateStaffRequest request, User adminUser, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (staffProfileRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
            throw new BadRequestException("Faculty ID is already registered: " + request.getEmployeeId());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STAFF);
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        StaffProfile profile = new StaffProfile();
        profile.setUser(savedUser);
        profile.setEmployeeId(request.getEmployeeId().trim().toUpperCase());
        profile.setFullName(request.getFullName().trim());
        profile.setDepartment(department);
        profile.setDesignation(request.getDesignation().trim());
        profile.setQualification(request.getQualification().trim());
        profile.setJoiningYear(request.getJoiningYear());
        profile.setMobileNumber(request.getMobileNumber());
        profile.setAddress(request.getAddress());
        staffProfileRepository.save(profile);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "STAFF_CREATED",
                "StaffProfile",
                profile.getId().toString(),
                "Created faculty account for " + profile.getFullName() + " (" + profile.getEmployeeId() + ") in " + department.getCode(),
                ipAddress
        );

        UserManagementDto dto = new UserManagementDto();
        dto.setId(savedUser.getId());
        dto.setEmail(savedUser.getEmail());
        dto.setRole(savedUser.getRole());
        dto.setStatus(savedUser.getStatus());
        dto.setFullName(profile.getFullName());
        dto.setIdentifier(profile.getEmployeeId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setDesignation(profile.getDesignation());
        dto.setCreatedAt(savedUser.getCreatedAt());
        return dto;
    }

    @Transactional
    public UserManagementDto createHod(CreateHodRequest request, User adminUser, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (hodProfileRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
            throw new BadRequestException("HOD Employee ID is already registered: " + request.getEmployeeId());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        // Check if an active HOD already exists for this department
        Optional<HodProfile> existingActiveHod = hodProfileRepository.findByDepartmentIdAndIsActiveTrue(department.getId());
        if (existingActiveHod.isPresent()) {
            throw new BadRequestException("An active HOD already exists for " + department.getName() + " (" + existingActiveHod.get().getFullName() + "). Deactivate or end their tenure before appointing a new HOD.");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.HOD);
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        HodProfile profile = new HodProfile();
        profile.setUser(savedUser);
        profile.setEmployeeId(request.getEmployeeId().trim().toUpperCase());
        profile.setFullName(request.getFullName().trim());
        profile.setDepartment(department);
        profile.setDesignation(request.getDesignation().trim());
        profile.setQualification(request.getQualification().trim());
        profile.setJoiningYear(request.getJoiningYear());
        profile.setStartDate(request.getStartDate());
        profile.setIsActive(true);
        profile.setMobileNumber(request.getMobileNumber());
        profile.setAddress(request.getAddress());
        hodProfileRepository.save(profile);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "HOD_CREATED",
                "HodProfile",
                profile.getId().toString(),
                "Created HOD account for " + profile.getFullName() + " (" + profile.getEmployeeId() + ") for department " + department.getCode(),
                ipAddress
        );

        UserManagementDto dto = new UserManagementDto();
        dto.setId(savedUser.getId());
        dto.setEmail(savedUser.getEmail());
        dto.setRole(savedUser.getRole());
        dto.setStatus(savedUser.getStatus());
        dto.setFullName(profile.getFullName());
        dto.setIdentifier(profile.getEmployeeId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setDesignation(profile.getDesignation());
        dto.setCreatedAt(savedUser.getCreatedAt());
        return dto;
    }

    // ─── Admin Profile (Batch 5D) ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminProfileDto getAdminProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AdminProfileDto dto = new AdminProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        dto.setTotalUsers(userRepository.count());
        dto.setTotalStudents(studentProfileRepository.count());
        dto.setTotalFaculty(staffProfileRepository.count());
        dto.setTotalDepartments(departmentRepository.count());
        dto.setTotalSubjects(subjectRepository.count());

        return dto;
    }
}
