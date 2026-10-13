package com.edusphere.repository;

import com.edusphere.entity.StudentPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentPortfolioRepository extends JpaRepository<StudentPortfolio, Long> {
    Optional<StudentPortfolio> findByStudentId(Long studentId);
}
