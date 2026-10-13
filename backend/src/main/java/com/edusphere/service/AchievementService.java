package com.edusphere.service;

import com.edusphere.dto.achievement.AchievementDto;
import com.edusphere.dto.achievement.SubmitAchievementRequest;
import com.edusphere.dto.achievement.VerifyAchievementRequest;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final FileStorageService fileStorageService;

    public AchievementService(AchievementRepository achievementRepository,
                              StudentProfileRepository studentProfileRepository,
                              StaffProfileRepository staffProfileRepository,
                              HodProfileRepository hodProfileRepository,
                              FileStorageService fileStorageService) {
        this.achievementRepository = achievementRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.fileStorageService = fileStorageService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Student Submission & Own List
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AchievementDto submitAchievement(Long userId, SubmitAchievementRequest request, MultipartFile certificate) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        String certificatePath = null;
        if (certificate != null && !certificate.isEmpty()) {
            certificatePath = fileStorageService.storeFile(certificate, "achievements");
        }

        Achievement achievement = new Achievement();
        achievement.setStudent(student);
        achievement.setCategory(request.getCategory());
        achievement.setTitle(request.getTitle());
        achievement.setDescription(request.getDescription());
        achievement.setAchievementDate(request.getAchievementDate());
        achievement.setCertificatePath(certificatePath);
        achievement.setStatus(AchievementStatus.PENDING);

        Achievement saved = achievementRepository.save(achievement);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AchievementDto> getMyAchievements(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        List<Achievement> list = achievementRepository.findByStudentIdOrderByAchievementDateDesc(student.getId());
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Department Achievements (Staff/HOD Review)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AchievementDto> getDepartmentAchievements(Long userId, Role role, AchievementStatus statusFilter) {
        if (role == Role.ADMIN) {
            List<Achievement> list = (statusFilter != null)
                    ? achievementRepository.findByStatusOrderByAchievementDateDesc(statusFilter)
                    : achievementRepository.findAll();
            return list.stream().map(this::toDto).collect(Collectors.toList());
        }

        Long deptId = null;
        if (role == Role.STAFF) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
            deptId = staff.getDepartment().getId();
        } else if (role == Role.HOD) {
            HodProfile hod = hodProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));
            deptId = hod.getDepartment().getId();
        }

        if (deptId == null) {
            return Collections.emptyList();
        }

        List<Achievement> list = (statusFilter != null)
                ? achievementRepository.findByStudentDepartmentIdAndStatusOrderByAchievementDateDesc(deptId, statusFilter)
                : achievementRepository.findByStudentDepartmentIdAndStatusOrderByAchievementDateDesc(deptId, AchievementStatus.PENDING);

        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public AchievementDto verifyAchievement(Long userId, Role role, Long achievementId, VerifyAchievementRequest request) {
        if (request.getStatus() != AchievementStatus.VERIFIED && request.getStatus() != AchievementStatus.REJECTED) {
            throw new BadRequestException("Verification status must be VERIFIED or REJECTED.");
        }

        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", achievementId));

        if (role != Role.ADMIN) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

            // Verify department match
            if (!Objects.equals(achievement.getStudent().getDepartment().getId(), staff.getDepartment().getId())) {
                throw new UnauthorizedAccessException("Cannot verify achievements for students outside your department.");
            }

            achievement.setVerifiedBy(staff);
        }

        achievement.setVerifiedAt(LocalDateTime.now());
        achievement.setRemarks(request.getRemarks());
        achievement.setStatus(request.getStatus());

        Achievement saved = achievementRepository.save(achievement);
        return toDto(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Authenticated Campus Verified Showcase
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AchievementDto> getVerifiedAchievements() {
        List<Achievement> list = achievementRepository.findByStatusOrderByAchievementDateDesc(AchievementStatus.VERIFIED);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: Map to DTO
    // ─────────────────────────────────────────────────────────────────────────
    private AchievementDto toDto(Achievement a) {
        AchievementDto dto = new AchievementDto();
        dto.setId(a.getId());
        if (a.getStudent() != null) {
            dto.setStudentProfileId(a.getStudent().getId());
            dto.setStudentName(a.getStudent().getFullName());
            dto.setStudentRegisterNumber(a.getStudent().getRegisterNumber());
            if (a.getStudent().getDepartment() != null) {
                dto.setDepartmentName(a.getStudent().getDepartment().getName());
                dto.setDepartmentCode(a.getStudent().getDepartment().getCode());
            }
            if (a.getStudent().getSection() != null) {
                dto.setSectionName(a.getStudent().getSection().getName());
            }
        }
        dto.setCategory(a.getCategory());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setAchievementDate(a.getAchievementDate());
        dto.setCertificatePath(a.getCertificatePath());
        dto.setStatus(a.getStatus());

        if (a.getVerifiedBy() != null) {
            dto.setVerifiedById(a.getVerifiedBy().getId());
            dto.setVerifiedByName(a.getVerifiedBy().getFullName());
        }
        dto.setVerifiedAt(a.getVerifiedAt());
        dto.setRemarks(a.getRemarks());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
