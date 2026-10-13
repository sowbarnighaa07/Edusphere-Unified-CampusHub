package com.edusphere.repository;

import com.edusphere.entity.Department;
import com.edusphere.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByDepartmentId(Long departmentId);
    Optional<Section> findByDepartmentAndName(Department department, String name);
    boolean existsByDepartmentIdAndName(Long departmentId, String name);
}
