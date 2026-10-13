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
public class TeachingAssignmentService {

    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final ClassroomRepository classroomRepository;
    private final AuditLogService auditLogService;

    public TeachingAssignmentService(TeachingAssignmentRepository teachingAssignmentRepository,
                                     StaffProfileRepository staffProfileRepository,
                                     SubjectRepository subjectRepository,
                                     SectionRepository sectionRepository,
                                     ClassroomRepository classroomRepository,
                                     AuditLogService auditLogService) {
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.classroomRepository = classroomRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<TeachingAssignmentDetailDto> getTeachingAssignments(Long staffId) {
        List<TeachingAssignment> assignments = staffId != null
                ? teachingAssignmentRepository.findByStaffId(staffId)
                : teachingAssignmentRepository.findAll();

        List<TeachingAssignmentDetailDto> result = new ArrayList<>();
        for (TeachingAssignment ta : assignments) {
            TeachingAssignmentDetailDto dto = new TeachingAssignmentDetailDto();
            dto.setId(ta.getId());
            dto.setStaffId(ta.getStaff().getId());
            dto.setStaffName(ta.getStaff().getFullName());
            dto.setEmployeeId(ta.getStaff().getEmployeeId());
            dto.setSubjectId(ta.getSubject().getId());
            dto.setSubjectCode(ta.getSubject().getCode());
            dto.setSubjectName(ta.getSubject().getName());
            dto.setDepartmentId(ta.getSubject().getDepartment().getId());
            dto.setDepartmentCode(ta.getSubject().getDepartment().getCode());
            dto.setDepartmentName(ta.getSubject().getDepartment().getName());
            dto.setSectionId(ta.getSection().getId());
            dto.setSectionName(ta.getSection().getName());
            dto.setSemester(ta.getSemester());
            dto.setAcademicYear(ta.getAcademicYear());

            classroomRepository.findByTeachingAssignmentId(ta.getId()).ifPresent(c -> {
                dto.setClassroomId(c.getId());
                dto.setClassroomName(c.getName());
            });

            result.add(dto);
        }
        return result;
    }

    @Transactional
    public TeachingAssignmentDetailDto createTeachingAssignment(CreateTeachingAssignmentRequest request, User adminUser, String ipAddress) {
        StaffProfile staff = staffProfileRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "id", request.getStaffId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));

        String academicYear = request.getAcademicYear().trim();

        if (teachingAssignmentRepository.existsByStaffIdAndSubjectIdAndSectionIdAndSemesterAndAcademicYear(
                staff.getId(), subject.getId(), section.getId(), request.getSemester(), academicYear)) {
            throw new BadRequestException("Teaching assignment already exists for this faculty, subject, section, semester, and academic year combination.");
        }

        TeachingAssignment assignment = new TeachingAssignment();
        assignment.setStaff(staff);
        assignment.setSubject(subject);
        assignment.setSection(section);
        assignment.setSemester(request.getSemester());
        assignment.setAcademicYear(academicYear);
        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        // Auto-provision virtual Classroom
        Classroom classroom = new Classroom();
        classroom.setTeachingAssignment(saved);
        classroom.setName(subject.getCode() + " - " + subject.getName() + " (" + subject.getDepartment().getCode() + " " + request.getSemester() + "-" + section.getName() + ")");
        classroom.setDescription("Official virtual classroom for " + subject.getName() + " (" + academicYear + ")");
        classroom.setIsActive(true);
        Classroom savedClassroom = classroomRepository.save(classroom);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "TEACHING_ASSIGNMENT_CREATED",
                "TeachingAssignment",
                saved.getId().toString(),
                "Assigned " + staff.getFullName() + " to " + subject.getCode() + " (Sec " + section.getName() + ", Sem " + request.getSemester() + ", " + academicYear + ") and auto-provisioned classroom #" + savedClassroom.getId(),
                ipAddress
        );

        TeachingAssignmentDetailDto dto = new TeachingAssignmentDetailDto();
        dto.setId(saved.getId());
        dto.setStaffId(staff.getId());
        dto.setStaffName(staff.getFullName());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setSubjectId(subject.getId());
        dto.setSubjectCode(subject.getCode());
        dto.setSubjectName(subject.getName());
        dto.setDepartmentId(subject.getDepartment().getId());
        dto.setDepartmentCode(subject.getDepartment().getCode());
        dto.setDepartmentName(subject.getDepartment().getName());
        dto.setSectionId(section.getId());
        dto.setSectionName(section.getName());
        dto.setSemester(saved.getSemester());
        dto.setAcademicYear(saved.getAcademicYear());
        dto.setClassroomId(savedClassroom.getId());
        dto.setClassroomName(savedClassroom.getName());
        return dto;
    }

    @Transactional
    public void deleteTeachingAssignment(Long id, User adminUser, String ipAddress) {
        TeachingAssignment assignment = teachingAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", id));

        classroomRepository.findByTeachingAssignmentId(id).ifPresent(classroomRepository::delete);
        teachingAssignmentRepository.delete(assignment);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "TEACHING_ASSIGNMENT_DELETED",
                "TeachingAssignment",
                id.toString(),
                "Deleted teaching assignment #" + id + " (" + assignment.getSubject().getCode() + " - " + assignment.getStaff().getFullName() + ")",
                ipAddress
        );
    }
}
