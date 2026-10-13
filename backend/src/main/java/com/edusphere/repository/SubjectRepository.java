package com.edusphere.repository;

import com.edusphere.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);
    List<Subject> findByDepartmentId(Long departmentId);
    List<Subject> findBySemester(Integer semester);
    List<Subject> findByDepartmentIdAndSemester(Long departmentId, Integer semester);
}
