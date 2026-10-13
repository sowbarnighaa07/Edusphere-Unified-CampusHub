package com.edusphere.service;

import com.edusphere.dto.staff.*;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StaffTeachingService {

    private final StaffProfileRepository staffProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMaterialRepository classroomMaterialRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final SubjectRepository subjectRepository;

    public StaffTeachingService(StaffProfileRepository staffProfileRepository,
                                TeachingAssignmentRepository teachingAssignmentRepository,
                                StudentProfileRepository studentProfileRepository,
                                SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                                ClassroomRepository classroomRepository,
                                ClassroomMaterialRepository classroomMaterialRepository,
                                AssignmentRepository assignmentRepository,
                                AssignmentSubmissionRepository assignmentSubmissionRepository,
                                UserRepository userRepository,
                                FileStorageService fileStorageService,
                                SubjectRepository subjectRepository) {
        this.staffProfileRepository = staffProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.classroomRepository = classroomRepository;
        this.classroomMaterialRepository = classroomMaterialRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.subjectRepository = subjectRepository;
    }

    // ─── Step 1: My Classes ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StaffClassSummaryDto> getStaffClasses(Long userId, Role userRole) {
        List<TeachingAssignment> assignments;

        if (userRole == Role.ADMIN) {
            assignments = teachingAssignmentRepository.findAll();
        } else {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
            assignments = teachingAssignmentRepository.findByStaffId(staff.getId());
        }

        List<StaffClassSummaryDto> result = new ArrayList<>();
        for (TeachingAssignment ta : assignments) {
            StaffClassSummaryDto dto = new StaffClassSummaryDto();
            dto.setTeachingAssignmentId(ta.getId());
            dto.setSubjectId(ta.getSubject().getId());
            dto.setSubjectCode(ta.getSubject().getCode());
            dto.setSubjectName(ta.getSubject().getName());
            dto.setCredits(ta.getSubject().getCredits());
            dto.setDepartmentId(ta.getSubject().getDepartment().getId());
            dto.setDepartmentCode(ta.getSubject().getDepartment().getCode());
            dto.setDepartmentName(ta.getSubject().getDepartment().getName());
            dto.setSectionId(ta.getSection().getId());
            dto.setSectionName(ta.getSection().getName());
            dto.setSemester(ta.getSemester());
            dto.setAcademicYear(ta.getAcademicYear());

            int studentCount = studentProfileRepository.findByDepartmentIdAndSectionId(
                    ta.getSubject().getDepartment().getId(), ta.getSection().getId()).size();
            dto.setEnrolledStudentCount(studentCount);

            classroomRepository.findByTeachingAssignmentId(ta.getId()).ifPresent(c -> {
                dto.setClassroomId(c.getId());
                dto.setClassroomName(c.getName());
            });

            result.add(dto);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<StaffClassStudentDto> getEnrolledStudentsForClass(Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));

        if (userRole != Role.ADMIN) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
            if (!ta.getStaff().getId().equals(staff.getId())) {
                throw new UnauthorizedAccessException("You do not have authorization to view student records for this teaching assignment.");
            }
        }

        List<StudentProfile> students = studentProfileRepository.findByDepartmentIdAndSectionId(
                ta.getSubject().getDepartment().getId(), ta.getSection().getId());

        List<StaffClassStudentDto> result = new ArrayList<>();
        for (StudentProfile sp : students) {
            StaffClassStudentDto dto = new StaffClassStudentDto();
            dto.setStudentProfileId(sp.getId());
            dto.setRegisterNumber(sp.getRegisterNumber());
            dto.setFullName(sp.getFullName());
            dto.setEmail(sp.getUser().getEmail());
            dto.setMobileNumber(sp.getMobileNumber());

            Optional<SubjectAcademicRecord> record = subjectAcademicRecordRepository
                    .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(
                            sp.getId(), ta.getSubject().getId(), ta.getSemester(), ta.getAcademicYear());

            if (record.isPresent()) {
                SubjectAcademicRecord r = record.get();
                if (r.getAttendancePercentage() != null) {
                    dto.setAttendancePercentage(r.getAttendancePercentage().doubleValue());
                }
                if (r.getIat1Score() != null) {
                    dto.setIat1Score(r.getIat1Score().doubleValue());
                }
                if (r.getIat2Score() != null) {
                    dto.setIat2Score(r.getIat2Score().doubleValue());
                }
                if (r.getAssignmentScore() != null) {
                    dto.setAssignmentScore(r.getAssignmentScore().doubleValue());
                }
            }

            result.add(dto);
        }
        return result;
    }

    // ─── Step 2: Classroom Operations & Materials ────────────────────────────

    @Transactional(readOnly = true)
    public ClassroomDto getClassroomDetails(Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));

        enforceStaffOwnership(userId, userRole, ta);

        Classroom classroom = classroomRepository.findByTeachingAssignmentId(ta.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "teachingAssignmentId", teachingAssignmentId));

        ClassroomDto dto = new ClassroomDto();
        dto.setClassroomId(classroom.getId());
        dto.setTeachingAssignmentId(ta.getId());
        dto.setName(classroom.getName());
        dto.setDescription(classroom.getDescription());
        dto.setIsActive(classroom.getIsActive());
        dto.setSubjectCode(ta.getSubject().getCode());
        dto.setSubjectName(ta.getSubject().getName());
        dto.setSectionName(ta.getSection().getName());
        dto.setDepartmentCode(ta.getSubject().getDepartment().getCode());
        dto.setSemester(ta.getSemester());
        dto.setAcademicYear(ta.getAcademicYear());
        dto.setMaterialCount(classroomMaterialRepository.findByClassroomIdOrderByCreatedAtDesc(classroom.getId()).size());
        dto.setAssignmentCount(assignmentRepository.findByTeachingAssignmentIdOrderByDeadlineAsc(ta.getId()).size());

        int studentCount = studentProfileRepository.findByDepartmentIdAndSectionId(
                ta.getSubject().getDepartment().getId(), ta.getSection().getId()).size();
        dto.setEnrolledStudentCount(studentCount);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ClassroomMaterialDto> getMaterials(Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));
        enforceStaffOwnership(userId, userRole, ta);

        Classroom classroom = classroomRepository.findByTeachingAssignmentId(ta.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "teachingAssignmentId", teachingAssignmentId));

        List<ClassroomMaterial> materials = classroomMaterialRepository.findByClassroomIdOrderByCreatedAtDesc(classroom.getId());
        List<ClassroomMaterialDto> result = new ArrayList<>();
        for (ClassroomMaterial m : materials) {
            result.add(toMaterialDto(m));
        }
        return result;
    }

    @Transactional
    public ClassroomMaterialDto uploadMaterial(Long userId, Role userRole, Long teachingAssignmentId,
                                               String title, String description, MultipartFile file) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));
        enforceStaffOwnership(userId, userRole, ta);

        Classroom classroom = classroomRepository.findByTeachingAssignmentId(ta.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "teachingAssignmentId", teachingAssignmentId));

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String storedPath = fileStorageService.storeFile(file, "materials");

        ClassroomMaterial material = new ClassroomMaterial();
        material.setClassroom(classroom);
        material.setTitle(title);
        material.setDescription(description);
        material.setFilePath(storedPath);
        material.setFileName(file.getOriginalFilename());
        material.setUploadedBy(uploader);

        ClassroomMaterial saved = classroomMaterialRepository.save(material);
        return toMaterialDto(saved);
    }

    @Transactional
    public void deleteMaterial(Long userId, Role userRole, Long materialId) {
        ClassroomMaterial material = classroomMaterialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassroomMaterial", "id", materialId));

        TeachingAssignment ta = material.getClassroom().getTeachingAssignment();
        enforceStaffOwnership(userId, userRole, ta);
        classroomMaterialRepository.delete(material);
    }

    // ─── Step 3: Assignment Management ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignments(Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));
        enforceStaffOwnership(userId, userRole, ta);

        List<Assignment> assignments = assignmentRepository.findByTeachingAssignmentIdOrderByDeadlineAsc(teachingAssignmentId);
        List<AssignmentDto> result = new ArrayList<>();
        for (Assignment a : assignments) {
            result.add(toAssignmentDto(a));
        }
        return result;
    }

    @Transactional
    public AssignmentDto createAssignment(Long userId, Role userRole, CreateAssignmentRequest request,
                                          MultipartFile attachmentFile) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(request.getTeachingAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", request.getTeachingAssignmentId()));
        enforceStaffOwnership(userId, userRole, ta);

        LocalDateTime deadline;
        try {
            deadline = LocalDateTime.parse(request.getDeadline());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid deadline format. Use ISO-8601: yyyy-MM-ddTHH:mm:ss");
        }

        Assignment assignment = new Assignment();
        assignment.setTeachingAssignment(ta);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(deadline);
        assignment.setMaxMarks(BigDecimal.valueOf(request.getMaxMarks()));

        if (attachmentFile != null && !attachmentFile.isEmpty()) {
            String path = fileStorageService.storeFile(attachmentFile, "assignments");
            assignment.setAttachmentPath(path);
        }

        Assignment saved = assignmentRepository.save(assignment);
        return toAssignmentDto(saved);
    }

    @Transactional
    public void deleteAssignment(Long userId, Role userRole, Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));
        enforceStaffOwnership(userId, userRole, assignment.getTeachingAssignment());
        assignmentRepository.delete(assignment);
    }

    // ─── Step 4: IAT & Attendance Batch Update ────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentAcademicRecordDto> getAcademicRecordsForClass(Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));
        enforceStaffOwnership(userId, userRole, ta);

        List<StudentProfile> students = studentProfileRepository.findByDepartmentIdAndSectionId(
                ta.getSubject().getDepartment().getId(), ta.getSection().getId());

        List<StudentAcademicRecordDto> result = new ArrayList<>();
        for (StudentProfile sp : students) {
            StudentAcademicRecordDto dto = new StudentAcademicRecordDto();
            dto.setStudentProfileId(sp.getId());
            dto.setRegisterNumber(sp.getRegisterNumber());
            dto.setFullName(sp.getFullName());

            subjectAcademicRecordRepository.findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(
                    sp.getId(), ta.getSubject().getId(), ta.getSemester(), ta.getAcademicYear()
            ).ifPresent(r -> {
                if (r.getIat1Score() != null) dto.setIat1Score(r.getIat1Score().doubleValue());
                if (r.getIat2Score() != null) dto.setIat2Score(r.getIat2Score().doubleValue());
                if (r.getAssignmentScore() != null) dto.setAssignmentScore(r.getAssignmentScore().doubleValue());
                if (r.getAttendancePercentage() != null) dto.setAttendancePercentage(r.getAttendancePercentage().doubleValue());
            });
            result.add(dto);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public StaffPerformanceOverviewDto getPerformanceAnalyticsForClass(
            Long userId, Role userRole, Long teachingAssignmentId) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));
        enforceStaffOwnership(userId, userRole, ta);

        List<StudentAcademicRecordDto> records = getAcademicRecordsForClass(userId, userRole, teachingAssignmentId);

        StaffPerformanceOverviewDto dto = new StaffPerformanceOverviewDto();
        dto.setTeachingAssignmentId(ta.getId());
        dto.setSubjectCode(ta.getSubject().getCode());
        dto.setSubjectName(ta.getSubject().getName());
        dto.setSectionName(ta.getSection().getName());
        dto.setDepartmentName(ta.getSubject().getDepartment().getName());
        dto.setSemester(ta.getSemester());
        dto.setAcademicYear(ta.getAcademicYear());
        dto.setTotalStudents(records.size());
        dto.setStudentRecords(records);

        double iat1Sum = 0;
        int iat1Count = 0;
        double iat2Sum = 0;
        int iat2Count = 0;
        double assignSum = 0;
        int assignCount = 0;
        double attSum = 0;
        int attCount = 0;
        int defaulters = 0;
        int highAtt = 0;
        int modAtt = 0;

        for (StudentAcademicRecordDto r : records) {
            if (r.getIat1Score() != null) {
                iat1Sum += r.getIat1Score();
                iat1Count++;
            }
            if (r.getIat2Score() != null) {
                iat2Sum += r.getIat2Score();
                iat2Count++;
            }
            if (r.getAssignmentScore() != null) {
                assignSum += r.getAssignmentScore();
                assignCount++;
            }
            if (r.getAttendancePercentage() != null) {
                double att = r.getAttendancePercentage();
                attSum += att;
                attCount++;
                if (att < 75.0) {
                    defaulters++;
                } else if (att >= 85.0) {
                    highAtt++;
                } else {
                    modAtt++;
                }
            }
        }

        dto.setEvaluatedIat1Count(iat1Count);
        dto.setAverageIat1(iat1Count > 0 ? Math.round((iat1Sum / iat1Count) * 100.0) / 100.0 : null);

        dto.setEvaluatedIat2Count(iat2Count);
        dto.setAverageIat2(iat2Count > 0 ? Math.round((iat2Sum / iat2Count) * 100.0) / 100.0 : null);

        dto.setEvaluatedAssignmentCount(assignCount);
        dto.setAverageAssignment(assignCount > 0 ? Math.round((assignSum / assignCount) * 100.0) / 100.0 : null);

        dto.setAverageAttendance(attCount > 0 ? Math.round((attSum / attCount) * 100.0) / 100.0 : null);
        dto.setAttendanceDefaultersCount(defaulters);
        dto.setHighAttendanceCount(highAtt);
        dto.setModerateAttendanceCount(modAtt);

        return dto;
    }

    @Transactional
    public void batchUpdateMarks(Long userId, Role userRole, BatchMarkUpdateRequest request) {
        TeachingAssignment ta = teachingAssignmentRepository.findById(request.getTeachingAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", request.getTeachingAssignmentId()));
        enforceStaffOwnership(userId, userRole, ta);

        String field = request.getField();
        if (!List.of("iat1Score", "iat2Score", "assignmentScore", "attendancePercentage").contains(field)) {
            throw new BadRequestException("Invalid field: " + field + ". Allowed: iat1Score, iat2Score, assignmentScore, attendancePercentage");
        }

        for (BatchMarkUpdateRequest.StudentMarkEntry entry : request.getEntries()) {
            StudentProfile sp = studentProfileRepository.findById(entry.getStudentProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", entry.getStudentProfileId()));

            SubjectAcademicRecord record = subjectAcademicRecordRepository
                    .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(
                            sp.getId(), ta.getSubject().getId(), ta.getSemester(), ta.getAcademicYear())
                    .orElseGet(() -> {
                        SubjectAcademicRecord r = new SubjectAcademicRecord();
                        r.setStudent(sp);
                        r.setSubject(ta.getSubject());
                        r.setSemester(ta.getSemester());
                        r.setAcademicYear(ta.getAcademicYear());
                        return r;
                    });

            BigDecimal val = entry.getValue() != null ? BigDecimal.valueOf(entry.getValue()) : null;
            switch (field) {
                case "iat1Score" -> record.setIat1Score(val);
                case "iat2Score" -> record.setIat2Score(val);
                case "assignmentScore" -> record.setAssignmentScore(val);
                case "attendancePercentage" -> record.setAttendancePercentage(val);
            }
            subjectAcademicRecordRepository.save(record);
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void enforceStaffOwnership(Long userId, Role userRole, TeachingAssignment ta) {
        if (userRole != Role.ADMIN) {
            StaffProfile staff = staffProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
            if (!ta.getStaff().getId().equals(staff.getId())) {
                throw new UnauthorizedAccessException("You are not authorized to access this classroom.");
            }
        }
    }

    private ClassroomMaterialDto toMaterialDto(ClassroomMaterial m) {
        ClassroomMaterialDto dto = new ClassroomMaterialDto();
        dto.setId(m.getId());
        dto.setClassroomId(m.getClassroom().getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setFileName(m.getFileName());
        dto.setFilePath(m.getFilePath());
        if (m.getUploadedBy() != null) {
            dto.setUploadedByName(m.getUploadedBy().getEmail());
        }
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    private AssignmentDto toAssignmentDto(Assignment a) {
        AssignmentDto dto = new AssignmentDto();
        dto.setId(a.getId());
        dto.setTeachingAssignmentId(a.getTeachingAssignment().getId());
        dto.setSubjectCode(a.getTeachingAssignment().getSubject().getCode());
        dto.setSubjectName(a.getTeachingAssignment().getSubject().getName());
        dto.setSectionName(a.getTeachingAssignment().getSection().getName());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setDeadline(a.getDeadline());
        dto.setMaxMarks(a.getMaxMarks());
        dto.setAttachmentPath(a.getAttachmentPath());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setSubmissionCount(assignmentSubmissionRepository.findByAssignmentId(a.getId()).size());
        return dto;
    }

    // ─── Staff Profile (Batch 5B) ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StaffProfileDto getStaffProfile(Long userId) {
        StaffProfile staff = staffProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

        StaffProfileDto dto = new StaffProfileDto();
        dto.setId(staff.getId());
        dto.setUserId(staff.getUser().getId());
        dto.setEmail(staff.getUser().getEmail());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setFullName(staff.getFullName());
        dto.setDepartmentId(staff.getDepartment().getId());
        dto.setDepartmentName(staff.getDepartment().getName());
        dto.setDepartmentCode(staff.getDepartment().getCode());
        dto.setDesignation(staff.getDesignation());
        dto.setQualification(staff.getQualification());
        dto.setJoiningYear(staff.getJoiningYear());
        dto.setDob(staff.getDob());
        dto.setGender(staff.getGender());
        dto.setMobileNumber(staff.getMobileNumber());
        dto.setAddress(staff.getAddress());
        dto.setCreatedAt(staff.getCreatedAt());
        return dto;
    }

    @Transactional
    public StaffProfileDto updateStaffProfile(Long userId, UpdateStaffProfileRequest request) {
        StaffProfile staff = staffProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));

        if (request.getMobileNumber() != null) {
            staff.setMobileNumber(request.getMobileNumber());
        }
        if (request.getAddress() != null) {
            staff.setAddress(request.getAddress());
        }
        if (request.getQualification() != null) {
            staff.setQualification(request.getQualification());
        }
        if (request.getDob() != null) {
            staff.setDob(request.getDob());
        }
        if (request.getGender() != null) {
            staff.setGender(request.getGender());
        }

        staffProfileRepository.save(staff);
        return getStaffProfile(userId);
    }
}
