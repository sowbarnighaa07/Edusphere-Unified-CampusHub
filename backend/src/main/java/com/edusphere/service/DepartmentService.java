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
import java.util.Optional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(DepartmentRepository departmentRepository,
                             SectionRepository sectionRepository,
                             SubjectRepository subjectRepository,
                             StaffProfileRepository staffProfileRepository,
                             HodProfileRepository hodProfileRepository,
                             StudentProfileRepository studentProfileRepository,
                             AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDetailDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentDetailDto> result = new ArrayList<>();

        for (Department d : departments) {
            DepartmentDetailDto dto = new DepartmentDetailDto();
            dto.setId(d.getId());
            dto.setName(d.getName());
            dto.setCode(d.getCode());
            dto.setSectionCount(sectionRepository.findByDepartmentId(d.getId()).size());
            dto.setSubjectCount(subjectRepository.findByDepartmentId(d.getId()).size());
            dto.setFacultyCount(staffProfileRepository.findByDepartmentId(d.getId()).size());

            Optional<HodProfile> hod = hodProfileRepository.findByDepartmentIdAndIsActiveTrue(d.getId());
            dto.setHodName(hod.map(HodProfile::getFullName).orElse("Unassigned"));

            result.add(dto);
        }
        return result;
    }

    @Transactional
    public DepartmentDetailDto createDepartment(CreateDepartmentRequest request, User adminUser, String ipAddress) {
        if (departmentRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Department code already exists: " + request.getCode());
        }

        Department department = new Department();
        department.setName(request.getName().trim());
        department.setCode(request.getCode().trim().toUpperCase());
        Department saved = departmentRepository.save(department);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "DEPARTMENT_CREATED",
                "Department",
                saved.getId().toString(),
                "Created department " + saved.getName() + " (" + saved.getCode() + ")",
                ipAddress
        );

        DepartmentDetailDto dto = new DepartmentDetailDto();
        dto.setId(saved.getId());
        dto.setName(saved.getName());
        dto.setCode(saved.getCode());
        dto.setSectionCount(0);
        dto.setSubjectCount(0);
        dto.setFacultyCount(0);
        dto.setHodName("Unassigned");
        return dto;
    }

    @Transactional
    public void deleteDepartment(Long id, User adminUser, String ipAddress) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        int sections = sectionRepository.findByDepartmentId(id).size();
        int subjects = subjectRepository.findByDepartmentId(id).size();
        int staff = staffProfileRepository.findByDepartmentId(id).size();

        if (sections > 0 || subjects > 0 || staff > 0) {
            throw new BadRequestException("Cannot delete department with active sections, subjects, or faculty. Reassign or remove dependencies first.");
        }

        departmentRepository.delete(department);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "DEPARTMENT_DELETED",
                "Department",
                id.toString(),
                "Deleted department " + department.getName() + " (" + department.getCode() + ")",
                ipAddress
        );
    }

    @Transactional(readOnly = true)
    public List<SectionDetailDto> getSections(Long departmentId) {
        List<Section> sections = departmentId != null
                ? sectionRepository.findByDepartmentId(departmentId)
                : sectionRepository.findAll();

        List<SectionDetailDto> result = new ArrayList<>();
        for (Section s : sections) {
            SectionDetailDto dto = new SectionDetailDto();
            dto.setId(s.getId());
            dto.setDepartmentId(s.getDepartment().getId());
            dto.setDepartmentName(s.getDepartment().getName());
            dto.setDepartmentCode(s.getDepartment().getCode());
            dto.setName(s.getName());
            dto.setStudentCount(studentProfileRepository.findByDepartmentIdAndSectionId(s.getDepartment().getId(), s.getId()).size());
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public SectionDetailDto createSection(CreateSectionRequest request, User adminUser, String ipAddress) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        String sectionName = request.getName().trim().toUpperCase();
        if (sectionRepository.existsByDepartmentIdAndName(department.getId(), sectionName)) {
            throw new BadRequestException("Section " + sectionName + " already exists in department " + department.getCode());
        }

        Section section = new Section();
        section.setDepartment(department);
        section.setName(sectionName);
        Section saved = sectionRepository.save(section);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "SECTION_CREATED",
                "Section",
                saved.getId().toString(),
                "Created section " + saved.getName() + " in department " + department.getCode(),
                ipAddress
        );

        SectionDetailDto dto = new SectionDetailDto();
        dto.setId(saved.getId());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());
        dto.setName(saved.getName());
        dto.setStudentCount(0);
        return dto;
    }

    @Transactional
    public void deleteSection(Long id, User adminUser, String ipAddress) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", id));

        int studentCount = studentProfileRepository.findByDepartmentIdAndSectionId(section.getDepartment().getId(), section.getId()).size();
        if (studentCount > 0) {
            throw new BadRequestException("Cannot delete section with " + studentCount + " enrolled students.");
        }

        sectionRepository.delete(section);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "admin",
                "SECTION_DELETED",
                "Section",
                id.toString(),
                "Deleted section " + section.getName() + " from department " + section.getDepartment().getCode(),
                ipAddress
        );
    }
}
