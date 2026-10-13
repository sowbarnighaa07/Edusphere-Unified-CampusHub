package com.edusphere.service;

import com.edusphere.dto.leave.ApplyLeaveRequest;
import com.edusphere.dto.leave.LeaveResponseDto;
import com.edusphere.dto.leave.StaffLeaveReviewRequest;
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
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final FileStorageService fileStorageService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        StudentProfileRepository studentProfileRepository,
                        StaffProfileRepository staffProfileRepository,
                        TeachingAssignmentRepository teachingAssignmentRepository,
                        FileStorageService fileStorageService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.fileStorageService = fileStorageService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Student Operations
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public LeaveResponseDto applyLeave(Long userId, ApplyLeaveRequest request, MultipartFile attachment) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new BadRequestException("From date cannot be after to date.");
        }

        String attachmentPath = null;
        if (attachment != null && !attachment.isEmpty()) {
            attachmentPath = fileStorageService.storeFile(attachment, "leaves");
        }

        LeaveRequest lr = new LeaveRequest();
        lr.setStudent(student);
        lr.setLeaveType(request.getLeaveType());
        lr.setFromDate(request.getFromDate());
        lr.setToDate(request.getToDate());
        lr.setReason(request.getReason());
        lr.setAttachmentPath(attachmentPath);
        lr.setStatus(LeaveStatus.PENDING_STAFF);

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getMyLeaveRequests(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        List<LeaveRequest> list = leaveRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void cancelLeave(Long userId, Long leaveId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        LeaveRequest lr = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (!Objects.equals(lr.getStudent().getId(), student.getId())) {
            throw new UnauthorizedAccessException("You cannot cancel a leave request that does not belong to you.");
        }

        if (lr.getStatus() != LeaveStatus.PENDING_STAFF) {
            throw new BadRequestException("Cannot cancel a leave application that is already under review or processed.");
        }

        leaveRequestRepository.delete(lr);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Staff Operations (Stage-1 Review)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getStaffAssignedLeaveRequests(Long userId, Role role, LeaveStatus statusFilter) {
        if (role == Role.ADMIN) {
            List<LeaveRequest> list = (statusFilter != null)
                    ? leaveRequestRepository.findByStatusOrderByCreatedAtDesc(statusFilter)
                    : leaveRequestRepository.findAll();
            return list.stream().map(this::toDto).collect(Collectors.toList());
        }

        StaffProfile staff = staffProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

        // Find all sections taught by this faculty member
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
        Set<Long> sectionIds = assignments.stream()
                .map(ta -> ta.getSection().getId())
                .collect(Collectors.toSet());

        if (sectionIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<LeaveRequest> matchedLeaves = new ArrayList<>();
        for (Long secId : sectionIds) {
            List<LeaveRequest> secLeaves = (statusFilter != null)
                    ? leaveRequestRepository.findByStudentSectionIdAndStatusOrderByCreatedAtDesc(secId, statusFilter)
                    : leaveRequestRepository.findByStudentSectionIdAndStatusOrderByCreatedAtDesc(secId, LeaveStatus.PENDING_STAFF);
            matchedLeaves.addAll(secLeaves);
        }

        // Deduplicate and sort
        return matchedLeaves.stream()
                .distinct()
                .sorted(Comparator.comparing(LeaveRequest::getCreatedAt).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveResponseDto reviewLeaveStage1(Long userId, Role role, Long leaveId, StaffLeaveReviewRequest request) {
        if (request.getStatus() != LeaveStatus.PENDING_HOD && request.getStatus() != LeaveStatus.REJECTED) {
            throw new BadRequestException("Faculty stage-1 review status must be PENDING_HOD (to recommend to HOD) or REJECTED.");
        }

        LeaveRequest lr = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (role != Role.ADMIN) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

            // Verify staff teaches student's section
            List<TeachingAssignment> assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
            boolean teachesSection = assignments.stream()
                    .anyMatch(ta -> Objects.equals(ta.getSection().getId(), lr.getStudent().getSection().getId()));

            if (!teachesSection) {
                throw new UnauthorizedAccessException("You are not authorized to review leave requests for students outside your assigned teaching classes.");
            }

            lr.setStaffReviewer(staff);
        }

        lr.setStaffReviewedAt(LocalDateTime.now());
        lr.setStaffRemarks(request.getRemarks());
        lr.setStatus(request.getStatus());

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return toDto(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: Map to DTO
    // ─────────────────────────────────────────────────────────────────────────

    public LeaveResponseDto toDto(LeaveRequest lr) {
        LeaveResponseDto dto = new LeaveResponseDto();
        dto.setId(lr.getId());
        if (lr.getStudent() != null) {
            dto.setStudentProfileId(lr.getStudent().getId());
            dto.setRegisterNumber(lr.getStudent().getRegisterNumber());
            dto.setStudentName(lr.getStudent().getFullName());
            dto.setDepartmentName(lr.getStudent().getDepartment() != null ? lr.getStudent().getDepartment().getName() : "");
            dto.setSectionName(lr.getStudent().getSection() != null ? lr.getStudent().getSection().getName() : "");
        }
        dto.setLeaveType(lr.getLeaveType());
        dto.setFromDate(lr.getFromDate());
        dto.setToDate(lr.getToDate());
        dto.setReason(lr.getReason());
        dto.setAttachmentPath(lr.getAttachmentPath());
        dto.setStatus(lr.getStatus());

        if (lr.getStaffReviewer() != null) {
            dto.setStaffReviewerName(lr.getStaffReviewer().getFullName());
        }
        dto.setStaffRemarks(lr.getStaffRemarks());
        dto.setStaffReviewedAt(lr.getStaffReviewedAt());

        if (lr.getHodReviewer() != null) {
            dto.setHodReviewerName(lr.getHodReviewer().getFullName());
        }
        dto.setHodRemarks(lr.getHodRemarks());
        dto.setHodReviewedAt(lr.getHodReviewedAt());
        dto.setCreatedAt(lr.getCreatedAt());
        return dto;
    }
}
