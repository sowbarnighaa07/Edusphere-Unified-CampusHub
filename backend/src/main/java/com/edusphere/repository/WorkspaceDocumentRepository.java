package com.edusphere.repository;

import com.edusphere.entity.WorkspaceDocument;
import com.edusphere.entity.WorkspaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceDocumentRepository extends JpaRepository<WorkspaceDocument, Long> {
    List<WorkspaceDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WorkspaceDocument> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, WorkspaceType type);
}
