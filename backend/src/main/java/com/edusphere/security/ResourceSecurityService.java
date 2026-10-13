package com.edusphere.security;

import com.edusphere.entity.Role;
import com.edusphere.entity.StaffProfile;
import com.edusphere.entity.StudentProfile;
import com.edusphere.entity.TeachingAssignment;
import com.edusphere.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("resourceSecurity")
public class ResourceSecurityService {

    private final StudentProfileRepository studentProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final HodProfileRepository hodProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;

    public ResourceSecurityService(StudentProfileRepository studentProfileRepository,
                                   StaffProfileRepository staffProfileRepository,
                                   HodProfileRepository hodProfileRepository,
                                   TeachingAssignmentRepository teachingAssignmentRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.hodProfileRepository = hodProfileRepository;
        this.teachingAssignmentRepository = teachingAssignmentRepository;
    }

    public boolean isStudentSelf(Authentication authentication, Long studentId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        if (principal.getRole() == Role.ADMIN) return true;
        return studentProfileRepository.findByUserId(principal.getId())
                .map(sp -> sp.getId().equals(studentId))
                .orElse(false);
    }

    public boolean hasTeachingAssignmentAccess(Authentication authentication, Long teachingAssignmentId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        if (principal.getRole() == Role.ADMIN) return true;
        
        StaffProfile staff = staffProfileRepository.findByUserId(principal.getId()).orElse(null);
        if (staff == null) return false;

        TeachingAssignment assignment = teachingAssignmentRepository.findById(teachingAssignmentId).orElse(null);
        if (assignment == null) return false;

        return assignment.getStaff().getId().equals(staff.getId());
    }

    public boolean isHodForDepartment(Authentication authentication, Long departmentId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        if (principal.getRole() == Role.ADMIN) return true;

        return hodProfileRepository.findByUserId(principal.getId())
                .map(hp -> hp.getIsActive() && hp.getDepartment().getId().equals(departmentId))
                .orElse(false);
    }
}
