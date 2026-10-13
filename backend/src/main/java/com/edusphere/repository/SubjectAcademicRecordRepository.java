package com.edusphere.repository;

import com.edusphere.entity.SubjectAcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectAcademicRecordRepository extends JpaRepository<SubjectAcademicRecord, Long> {
    List<SubjectAcademicRecord> findByStudentId(Long studentId);
    List<SubjectAcademicRecord> findByStudentIdAndSemester(Long studentId, Integer semester);
    List<SubjectAcademicRecord> findByStudentIdAndSemesterAndAcademicYear(Long studentId, Integer semester, String academicYear);
    Optional<SubjectAcademicRecord> findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(
            Long studentId, Long subjectId, Integer semester, String academicYear);
    List<SubjectAcademicRecord> findBySubjectIdAndSemesterAndAcademicYear(
            Long subjectId, Integer semester, String academicYear);
    List<SubjectAcademicRecord> findBySubjectDepartmentId(Long departmentId);
    List<SubjectAcademicRecord> findBySubjectId(Long subjectId);
}
