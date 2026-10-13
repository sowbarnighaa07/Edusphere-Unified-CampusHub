package com.edusphere.repository;

import com.edusphere.entity.ResultStatus;
import com.edusphere.entity.SemesterResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterResultRepository extends JpaRepository<SemesterResult, Long> {
    List<SemesterResult> findByStudentIdOrderBySemesterAsc(Long studentId);
    Optional<SemesterResult> findByStudentIdAndSemesterAndAcademicYear(Long studentId, Integer semester, String academicYear);
    Optional<SemesterResult> findByStudentIdAndSemester(Long studentId, Integer semester);
    List<SemesterResult> findByStudentSectionIdAndSemesterAndAcademicYear(Long sectionId, Integer semester, String academicYear);
    List<SemesterResult> findBySemesterAndAcademicYear(Integer semester, String academicYear);
    List<SemesterResult> findByStudentIdAndStatusOrderBySemesterAsc(Long studentId, ResultStatus status);
}
