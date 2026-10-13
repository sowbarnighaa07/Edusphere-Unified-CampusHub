package com.edusphere.service;

import com.edusphere.dto.admin.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final AuditLogService auditLogService;

    public SubjectService(SubjectRepository subjectRepository,
                          DepartmentRepository departmentRepository,
                          TeachingAssignmentRepository teachingAssignmentRepository,
                          AuditLogService auditLogService) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<SubjectDetailDto> getSubjects(Long departmentId, Integer semester) {
        List<Subject> subjects;
        if (departmentId != null && semester != null) {
            subjects = subjectRepository.findByDepartmentIdAndSemester(departmentId, semester);
        } else if (departmentId != null) {
            subjects = subjectRepository.findByDepartmentId(departmentId);
        } else if (semester != null) {
            subjects = subjectRepository.findBySemester(semester);
        } else {
            subjects = subjectRepository.findAll();
        }

        List<SubjectDetailDto> result = new ArrayList<>();
        for (Subject s : subjects) {
            SubjectDetailDto dto = new SubjectDetailDto();
            dto.setId(s.getId());
            dto.setDepartmentId(s.getDepartment().getId());
            dto.setDepartmentName(s.getDepartment().getName());
            dto.setDepartmentCode(s.getDepartment().getCode());
            dto.setCode(s.getCode());
            dto.setName(s.getName());
            dto.setSemester(s.getSemester());
            dto.setCredits(s.getCredits());
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public SubjectDetailDto createSubject(CreateSubjectRequest request, User adminUser, String ipAddress) {
        String code = request.getCode().trim().toUpperCase();
        if (subjectRepository.existsByCode(code)) {
            throw new BadRequestException("Subject code already exists: " + code);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Subject subject = new Subject();
        subject.setDepartment(department);
        subject.setCode(code);
        subject.setName(request.getName().trim());
        subject.setSemester(request.getSemester());
        subject.setCredits(request.getCredits());
        Subject saved = subjectRepository.save(subject);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "SUBJECT_CREATED",
                "Subject",
                saved.getId().toString(),
                "Created subject " + saved.getCode() + " - " + saved.getName() + " (Sem " + saved.getSemester() + ")",
                ipAddress
        );

        SubjectDetailDto dto = new SubjectDetailDto();
        dto.setId(saved.getId());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setCode(saved.getCode());
        dto.setName(saved.getName());
        dto.setSemester(saved.getSemester());
        dto.setCredits(saved.getCredits());
        return dto;
    }

    @Transactional
    public void deleteSubject(Long id, User adminUser, String ipAddress) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        int assignmentCount = teachingAssignmentRepository.findBySubjectId(id).size();
        if (assignmentCount > 0) {
            throw new BadRequestException("Cannot delete subject with " + assignmentCount + " active teaching assignments.");
        }

        subjectRepository.delete(subject);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "SUBJECT_DELETED",
                "Subject",
                id.toString(),
                "Deleted subject " + subject.getCode() + " - " + subject.getName(),
                ipAddress
        );
    }
}
