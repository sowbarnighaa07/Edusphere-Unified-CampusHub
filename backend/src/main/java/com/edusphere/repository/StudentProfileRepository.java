package com.edusphere.repository;

import com.edusphere.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByUserEmail(String email);
    Optional<StudentProfile> findByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumber(String registerNumber);
    List<StudentProfile> findByDepartmentId(Long departmentId);
    List<StudentProfile> findBySectionId(Long sectionId);
    List<StudentProfile> findByDepartmentIdAndSectionId(Long departmentId, Long sectionId);
    long countByDepartmentId(Long departmentId);
}
