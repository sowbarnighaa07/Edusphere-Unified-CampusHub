package com.edusphere.config;

import com.edusphere.entity.*;
import com.edusphere.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           SectionRepository sectionRepository,
                           SubjectRepository subjectRepository,
                           StudentProfileRepository studentProfileRepository,
                           StaffProfileRepository staffProfileRepository,
                           HodProfileRepository hodProfileRepository,
                           TeachingAssignmentRepository teachingAssignmentRepository,
                           ClassroomRepository classroomRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.classroomRepository = classroomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with seed data.");
            return;
        }

        log.info("Starting EduSphere database seed initialization...");

        // 1. Admin Account
        User adminUser = new User();
        adminUser.setEmail("admin@edusphere.edu");
        adminUser.setPasswordHash(passwordEncoder.encode("Admin@123"));
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);

        // 2. Departments
        Department cseDept = departmentRepository.save(new Department(null, "Computer Science and Engineering", "CSE"));
        Department eceDept = departmentRepository.save(new Department(null, "Electronics and Communication Engineering", "ECE"));
        Department mechDept = departmentRepository.save(new Department(null, "Mechanical Engineering", "MECH"));

        // 3. Sections
        Section cseA = sectionRepository.save(new Section(null, cseDept, "A"));
        Section cseB = sectionRepository.save(new Section(null, cseDept, "B"));
        Section eceA = sectionRepository.save(new Section(null, eceDept, "A"));
        Section mechA = sectionRepository.save(new Section(null, mechDept, "A"));

        // 4. Subjects
        Subject javaSub = new Subject();
        javaSub.setDepartment(cseDept);
        javaSub.setCode("CS8101");
        javaSub.setName("Programming in Java");
        javaSub.setSemester(1);
        javaSub.setCredits(4);
        javaSub = subjectRepository.save(javaSub);

        Subject dbmsSub = new Subject();
        dbmsSub.setDepartment(cseDept);
        dbmsSub.setCode("CS8102");
        dbmsSub.setName("Database Management Systems");
        dbmsSub.setSemester(1);
        dbmsSub.setCredits(3);
        dbmsSub = subjectRepository.save(dbmsSub);

        Subject mathSub = new Subject();
        mathSub.setDepartment(cseDept);
        mathSub.setCode("MA8151");
        mathSub.setName("Engineering Mathematics I");
        mathSub.setSemester(1);
        mathSub.setCredits(4);
        mathSub = subjectRepository.save(mathSub);

        // 5. HOD Account
        User hodUser = new User();
        hodUser.setEmail("hod.cse@edusphere.edu");
        hodUser.setPasswordHash(passwordEncoder.encode("Hod@123"));
        hodUser.setRole(Role.HOD);
        hodUser.setStatus(UserStatus.ACTIVE);
        hodUser = userRepository.save(hodUser);

        HodProfile hodProfile = new HodProfile();
        hodProfile.setUser(hodUser);
        hodProfile.setEmployeeId("HOD-CSE-01");
        hodProfile.setFullName("Dr. Aris Thorne");
        hodProfile.setDepartment(cseDept);
        hodProfile.setDesignation("Professor & Head of Department");
        hodProfile.setQualification("Ph.D. in Computer Science");
        hodProfile.setJoiningYear(2015);
        hodProfile.setStartDate(LocalDate.of(2020, 6, 1));
        hodProfile.setIsActive(true);
        hodProfile.setGender(Gender.MALE);
        hodProfile.setMobileNumber("+91 9876543210");
        hodProfile.setAddress("Department of CSE, EduSphere Campus");
        hodProfileRepository.save(hodProfile);

        // 6. Staff Account
        User staffUser = new User();
        staffUser.setEmail("staff.cse@edusphere.edu");
        staffUser.setPasswordHash(passwordEncoder.encode("Staff@123"));
        staffUser.setRole(Role.STAFF);
        staffUser.setStatus(UserStatus.ACTIVE);
        staffUser = userRepository.save(staffUser);

        StaffProfile staffProfile = new StaffProfile();
        staffProfile.setUser(staffUser);
        staffProfile.setEmployeeId("FAC-CSE-101");
        staffProfile.setFullName("Prof. Elena Vance");
        staffProfile.setDepartment(cseDept);
        staffProfile.setDesignation("Assistant Professor");
        staffProfile.setQualification("M.Tech, Ph.D.");
        staffProfile.setJoiningYear(2021);
        staffProfile.setGender(Gender.FEMALE);
        staffProfile.setMobileNumber("+91 9876543211");
        staffProfile.setAddress("Faculty Quarters B-12, EduSphere Campus");
        staffProfile = staffProfileRepository.save(staffProfile);

        // 7. Teaching Assignment & Classroom
        TeachingAssignment teachingAssignment = new TeachingAssignment();
        teachingAssignment.setStaff(staffProfile);
        teachingAssignment.setSubject(javaSub);
        teachingAssignment.setSection(cseA);
        teachingAssignment.setSemester(1);
        teachingAssignment.setAcademicYear("2026-2027");
        teachingAssignment = teachingAssignmentRepository.save(teachingAssignment);

        Classroom classroom = new Classroom();
        classroom.setTeachingAssignment(teachingAssignment);
        classroom.setName("CS8101 - Programming in Java (CSE 1-A)");
        classroom.setDescription("Official virtual classroom for Semester 1 Java Programming course.");
        classroom.setIsActive(true);
        classroomRepository.save(classroom);

        // 8. Active First-Year Student
        User studentUser = new User();
        studentUser.setEmail("student1@edusphere.edu");
        studentUser.setPasswordHash(passwordEncoder.encode("Student@123"));
        studentUser.setRole(Role.STUDENT);
        studentUser.setStatus(UserStatus.ACTIVE);
        studentUser = userRepository.save(studentUser);

        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(studentUser);
        studentProfile.setRegisterNumber("2026CSE001");
        studentProfile.setFullName("Alex Mercer");
        studentProfile.setDepartment(cseDept);
        studentProfile.setSection(cseA);
        studentProfile.setEnrollmentYear(2026);
        studentProfile.setExpectedGraduationYear(2030);
        studentProfile.setGender(Gender.MALE);
        studentProfile.setMobileNumber("+91 9876543220");
        studentProfile.setCity("Chennai");
        studentProfile.setState("Tamil Nadu");
        studentProfile.setPincode("600025");
        studentProfileRepository.save(studentProfile);

        // 9. Pending Student for Admin Approval Workflow Verification
        User pendingStudentUser = new User();
        pendingStudentUser.setEmail("student.pending@edusphere.edu");
        pendingStudentUser.setPasswordHash(passwordEncoder.encode("Student@123"));
        pendingStudentUser.setRole(Role.STUDENT);
        pendingStudentUser.setStatus(UserStatus.PENDING);
        pendingStudentUser = userRepository.save(pendingStudentUser);

        StudentProfile pendingProfile = new StudentProfile();
        pendingProfile.setUser(pendingStudentUser);
        pendingProfile.setRegisterNumber("2026CSE002");
        pendingProfile.setFullName("Sarah Connor");
        pendingProfile.setDepartment(cseDept);
        pendingProfile.setSection(cseA);
        pendingProfile.setEnrollmentYear(2026);
        pendingProfile.setExpectedGraduationYear(2030);
        pendingProfile.setGender(Gender.FEMALE);
        studentProfileRepository.save(pendingProfile);

        log.info("EduSphere database seed initialization completed successfully.");
    }
}
