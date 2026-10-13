package com.edusphere.service;

import com.edusphere.dto.auth.AuthResponse;
import com.edusphere.dto.auth.LoginRequest;
import com.edusphere.dto.auth.StudentRegistrationRequest;
import com.edusphere.dto.auth.UserSummaryDto;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.repository.*;
import com.edusphere.security.JwtTokenProvider;
import com.edusphere.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder,
                       UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       StaffProfileRepository staffProfileRepository,
                       HodProfileRepository hodProfileRepository,
                       DepartmentRepository departmentRepository,
                       SectionRepository sectionRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        UserSummaryDto userSummary = getUserSummary(userPrincipal.getId(), userPrincipal.getRole());

        return new AuthResponse(jwt, userSummary);
    }

    @Transactional
    public UserSummaryDto registerStudent(StudentRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (studentProfileRepository.existsByRegisterNumber(request.getRegisterNumber().trim())) {
            throw new BadRequestException("Register number is already in use: " + request.getRegisterNumber());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));

        if (!section.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Selected section does not belong to the selected department");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.PENDING); // Must be approved by Admin

        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile();
        profile.setUser(savedUser);
        profile.setRegisterNumber(request.getRegisterNumber().trim().toUpperCase());
        profile.setFullName(request.getFullName().trim());
        profile.setDepartment(department);
        profile.setSection(section);
        profile.setEnrollmentYear(request.getEnrollmentYear());
        profile.setExpectedGraduationYear(request.getExpectedGraduationYear());

        studentProfileRepository.save(profile);

        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(savedUser.getId());
        dto.setEmail(savedUser.getEmail());
        dto.setFullName(profile.getFullName());
        dto.setRole(savedUser.getRole());
        dto.setStatus(savedUser.getStatus());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setSectionId(section.getId());
        dto.setSectionName(section.getName());
        dto.setRegisterNumber(profile.getRegisterNumber());

        return dto;
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal userPrincipal) {
        return getUserSummary(userPrincipal.getId(), userPrincipal.getRole());
    }

    private UserSummaryDto getUserSummary(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());

        switch (role) {
            case STUDENT -> {
                studentProfileRepository.findByUserId(userId).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setRegisterNumber(sp.getRegisterNumber());
                    dto.setDepartmentId(sp.getDepartment().getId());
                    dto.setDepartmentName(sp.getDepartment().getName());
                    dto.setDepartmentCode(sp.getDepartment().getCode());
                    dto.setSectionId(sp.getSection().getId());
                    dto.setSectionName(sp.getSection().getName());
                });
            }
            case STAFF -> {
                staffProfileRepository.findByUserId(userId).ifPresent(sp -> {
                    dto.setFullName(sp.getFullName());
                    dto.setEmployeeId(sp.getEmployeeId());
                    dto.setDepartmentId(sp.getDepartment().getId());
                    dto.setDepartmentName(sp.getDepartment().getName());
                    dto.setDepartmentCode(sp.getDepartment().getCode());
                });
            }
            case HOD -> {
                hodProfileRepository.findByUserId(userId).ifPresent(hp -> {
                    dto.setFullName(hp.getFullName());
                    dto.setEmployeeId(hp.getEmployeeId());
                    dto.setDepartmentId(hp.getDepartment().getId());
                    dto.setDepartmentName(hp.getDepartment().getName());
                    dto.setDepartmentCode(hp.getDepartment().getCode());
                });
            }
            case ADMIN -> dto.setFullName("System Administrator");
        }

        return dto;
    }
}
