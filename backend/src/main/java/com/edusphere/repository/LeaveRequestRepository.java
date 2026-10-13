package com.edusphere.repository;

import com.edusphere.entity.LeaveRequest;
import com.edusphere.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
    List<LeaveRequest> findByStudentDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<LeaveRequest> findByStudentDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, LeaveStatus status);
    List<LeaveRequest> findByStudentSectionIdAndStatusOrderByCreatedAtDesc(Long sectionId, LeaveStatus status);
    long countByStudentDepartmentIdAndStatus(Long departmentId, LeaveStatus status);
}
