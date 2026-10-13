package com.edusphere.repository;

import com.edusphere.entity.ExcelImportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExcelImportLogRepository extends JpaRepository<ExcelImportLog, Long> {
    List<ExcelImportLog> findByUploadedByIdOrderByCreatedAtDesc(Long staffId);
    List<ExcelImportLog> findAllByOrderByCreatedAtDesc();
}
