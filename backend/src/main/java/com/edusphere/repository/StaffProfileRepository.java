package com.edusphere.repository;

import com.edusphere.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    Optional<StaffProfile> findByUserId(Long userId);
    Optional<StaffProfile> findByUserEmail(String email);
    Optional<StaffProfile> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    List<StaffProfile> findByDepartmentId(Long departmentId);
    long countByDepartmentId(Long departmentId);
}
