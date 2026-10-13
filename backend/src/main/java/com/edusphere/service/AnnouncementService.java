package com.edusphere.service;

import com.edusphere.dto.announcement.AnnouncementDto;
import com.edusphere.dto.announcement.CreateAnnouncementRequest;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               UserRepository userRepository,
                               DepartmentRepository departmentRepository,
                               SectionRepository sectionRepository,
                               SubjectRepository subjectRepository,
                               StudentProfileRepository studentProfileRepository,
                               StaffProfileRepository staffProfileRepository,
                               HodProfileRepository hodProfileRepository,
                               TeachingAssignmentRepository teachingAssignmentRepository) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Get Announcements Visible to Current Authenticated User
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsForUser(Long userId, Role role) {
        List<Announcement> all = announcementRepository.findAllByOrderByCreatedAtDesc();

        if (role == Role.ADMIN) {
            return all.stream().map(this::toDto).collect(Collectors.toList());
        }

        Long userDeptId = null;
        Long studentSecId = null;
        Set<Long> staffSectionIds = new HashSet<>();
        Set<Long> staffSubjectIds = new HashSet<>();

        if (role == Role.STUDENT) {
            Optional<StudentProfile> spOpt = studentProfileRepository.findByUserId(userId);
            if (spOpt.isPresent()) {
                userDeptId = spOpt.get().getDepartment().getId();
                studentSecId = spOpt.get().getSection().getId();
            }
        } else if (role == Role.STAFF) {
            Optional<StaffProfile> stOpt = staffProfileRepository.findByUserId(userId);
            if (stOpt.isPresent()) {
                userDeptId = stOpt.get().getDepartment().getId();
                List<TeachingAssignment> taList = teachingAssignmentRepository.findByStaffId(stOpt.get().getId());
                for (TeachingAssignment ta : taList) {
                    staffSectionIds.add(ta.getSection().getId());
                    staffSubjectIds.add(ta.getSubject().getId());
                }
            }
        } else if (role == Role.HOD) {
            Optional<HodProfile> hodOpt = hodProfileRepository.findByUserId(userId);
            if (hodOpt.isPresent()) {
                userDeptId = hodOpt.get().getDepartment().getId();
            }
        }

        final Long deptIdFilter = userDeptId;
        final Long secIdFilter = studentSecId;

        List<Announcement> visible = all.stream().filter(a -> {
            if (a.getScope() == AnnouncementScope.INSTITUTION) {
                return true;
            }
            if (a.getScope() == AnnouncementScope.DEPARTMENT) {
                return a.getDepartment() != null && Objects.equals(a.getDepartment().getId(), deptIdFilter);
            }
            if (a.getScope() == AnnouncementScope.CLASS) {
                if (role == Role.STUDENT) {
                    return a.getSection() != null && Objects.equals(a.getSection().getId(), secIdFilter);
                } else if (role == Role.STAFF) {
                    boolean matchesSection = a.getSection() != null && staffSectionIds.contains(a.getSection().getId());
                    boolean matchesSubject = a.getSubject() != null && staffSubjectIds.contains(a.getSubject().getId());
                    return matchesSection || matchesSubject;
                } else if (role == Role.HOD) {
                    return a.getDepartment() != null && Objects.equals(a.getDepartment().getId(), deptIdFilter);
                }
            }
            return false;
        }).collect(Collectors.toList());

        return visible.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Create Announcement with Strict Role-Based Target Validation
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AnnouncementDto createAnnouncement(Long userId, Role role, CreateAnnouncementRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setScope(request.getScope());
        announcement.setCreatedBy(user);

        // Security Validation
        if (role == Role.ADMIN) {
            // Admin can post at all scopes
            if (request.getDepartmentId() != null) {
                announcement.setDepartment(departmentRepository.findById(request.getDepartmentId()).orElse(null));
            }
            if (request.getSectionId() != null) {
                announcement.setSection(sectionRepository.findById(request.getSectionId()).orElse(null));
            }
            if (request.getSubjectId() != null) {
                announcement.setSubject(subjectRepository.findById(request.getSubjectId()).orElse(null));
            }
        } else if (role == Role.HOD) {
            HodProfile hod = hodProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("HodProfile", "userId", userId));

            if (request.getScope() == AnnouncementScope.INSTITUTION) {
                throw new UnauthorizedAccessException("HODs cannot broadcast institution-wide bulletins. Use DEPARTMENT scope.");
            }

            // Must belong to HOD's department
            Department dept = hod.getDepartment();
            announcement.setDepartment(dept);

            if (request.getScope() == AnnouncementScope.CLASS && request.getSectionId() != null) {
                Section sec = sectionRepository.findById(request.getSectionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
                if (!Objects.equals(sec.getDepartment().getId(), dept.getId())) {
                    throw new UnauthorizedAccessException("Cannot post notices to sections outside your department.");
                }
                announcement.setSection(sec);
            }
        } else if (role == Role.STAFF) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

            if (request.getScope() != AnnouncementScope.CLASS) {
                throw new UnauthorizedAccessException("Faculty members can only post CLASS-level notices to their assigned teaching cohorts.");
            }

            if (request.getSectionId() == null) {
                throw new BadRequestException("Section ID is required for CLASS-level announcement.");
            }

            // Verify staff teaches this section
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            boolean authorizedSection = assignments.stream()
                    .anyMatch(ta -> Objects.equals(ta.getSection().getId(), request.getSectionId()));

            if (!authorizedSection) {
                throw new UnauthorizedAccessException("You are not allocated to teach the specified section.");
            }

            Section sec = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
            announcement.setSection(sec);
            announcement.setDepartment(sec.getDepartment());

            if (request.getSubjectId() != null) {
                boolean authorizedSubject = assignments.stream()
                        .anyMatch(ta -> Objects.equals(ta.getSection().getId(), request.getSectionId())
                                && Objects.equals(ta.getSubject().getId(), request.getSubjectId()));
                if (!authorizedSubject) {
                    throw new UnauthorizedAccessException("You are not allocated to teach the specified subject for this section.");
                }
                Subject sub = subjectRepository.findById(request.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
                announcement.setSubject(sub);
            }
        } else {
            throw new UnauthorizedAccessException("Students cannot publish campus announcements.");
        }

        Announcement saved = announcementRepository.save(announcement);
        return toDto(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Delete Announcement
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteAnnouncement(Long userId, Role role, Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", announcementId));

        if (role != Role.ADMIN && !Objects.equals(announcement.getCreatedBy().getId(), userId)) {
            throw new UnauthorizedAccessException("You can only delete announcements that you created.");
        }

        announcementRepository.delete(announcement);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: Map to DTO
    // ─────────────────────────────────────────────────────────────────────────
    private AnnouncementDto toDto(Announcement a) {
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setScope(a.getScope());

        if (a.getDepartment() != null) {
            dto.setDepartmentId(a.getDepartment().getId());
            dto.setDepartmentName(a.getDepartment().getName());
            dto.setDepartmentCode(a.getDepartment().getCode());
        }
        if (a.getSection() != null) {
            dto.setSectionId(a.getSection().getId());
            dto.setSectionName(a.getSection().getName());
        }
        if (a.getSubject() != null) {
            dto.setSubjectId(a.getSubject().getId());
            dto.setSubjectCode(a.getSubject().getCode());
            dto.setSubjectName(a.getSubject().getName());
        }

        if (a.getCreatedBy() != null) {
            dto.setCreatedById(a.getCreatedBy().getId());
            dto.setAuthorEmail(a.getCreatedBy().getEmail());
            dto.setAuthorRole(a.getCreatedBy().getRole().name());

            // Try to resolve human name
            if (a.getCreatedBy().getRole() == Role.STAFF) {
                staffProfileRepository.findByUserId(a.getCreatedBy().getId())
                        .ifPresent(sp -> dto.setAuthorName(sp.getFullName()));
            } else if (a.getCreatedBy().getRole() == Role.HOD) {
                hodProfileRepository.findByUserId(a.getCreatedBy().getId())
                        .ifPresent(hp -> dto.setAuthorName(hp.getFullName()));
            } else if (a.getCreatedBy().getRole() == Role.ADMIN) {
                dto.setAuthorName("Institution Administrator");
            } else {
                dto.setAuthorName(a.getCreatedBy().getEmail());
            }
        }
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
