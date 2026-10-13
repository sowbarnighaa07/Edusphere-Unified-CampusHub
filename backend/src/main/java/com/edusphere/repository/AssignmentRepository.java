package com.edusphere.repository;

import com.edusphere.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTeachingAssignmentIdOrderByDeadlineAsc(Long teachingAssignmentId);
    List<Assignment> findByTeachingAssignmentSectionIdOrderByDeadlineAsc(Long sectionId);
}
