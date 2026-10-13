package com.edusphere.repository;

import com.edusphere.entity.TeachingAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeachingAssignmentRepository extends JpaRepository<TeachingAssignment, Long> {
    List<TeachingAssignment> findByStaffId(Long staffId);
    List<TeachingAssignment> findByStaffIdAndAcademicYear(Long staffId, String academicYear);
    List<TeachingAssignment> findBySubjectId(Long subjectId);
    List<TeachingAssignment> findBySectionId(Long sectionId);
    List<TeachingAssignment> findBySectionIdAndSemesterAndAcademicYear(Long sectionId, Integer semester, String academicYear);
    List<TeachingAssignment> findBySubjectDepartmentId(Long departmentId);
    List<TeachingAssignment> findByStaffDepartmentId(Long departmentId);
    Optional<TeachingAssignment> findByStaffIdAndSubjectIdAndSectionIdAndSemesterAndAcademicYear(
            Long staffId, Long subjectId, Long sectionId, Integer semester, String academicYear);
    boolean existsByStaffIdAndSubjectIdAndSectionIdAndSemesterAndAcademicYear(
            Long staffId, Long subjectId, Long sectionId, Integer semester, String academicYear);
}
