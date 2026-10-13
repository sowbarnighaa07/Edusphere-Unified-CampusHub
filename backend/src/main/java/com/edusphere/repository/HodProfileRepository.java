package com.edusphere.repository;

import com.edusphere.entity.HodProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HodProfileRepository extends JpaRepository<HodProfile, Long> {
    Optional<HodProfile> findByUserId(Long userId);
    Optional<HodProfile> findByUserEmail(String email);
    Optional<HodProfile> findByDepartmentIdAndIsActiveTrue(Long departmentId);
    Optional<HodProfile> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    List<HodProfile> findByDepartmentId(Long departmentId);
}
