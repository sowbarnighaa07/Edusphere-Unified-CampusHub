package com.edusphere.service;

import com.edusphere.dto.workspace.CreateWorkspaceDocumentRequest;
import com.edusphere.dto.workspace.UpdateWorkspaceDocumentRequest;
import com.edusphere.dto.workspace.WorkspaceDocumentDto;
import com.edusphere.entity.User;
import com.edusphere.entity.WorkspaceDocument;
import com.edusphere.entity.WorkspaceType;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.UserRepository;
import com.edusphere.repository.WorkspaceDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceDocumentRepository workspaceDocumentRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceDocumentRepository workspaceDocumentRepository,
                            UserRepository userRepository) {
        this.workspaceDocumentRepository = workspaceDocumentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDocumentDto> getMyDocuments(Long userId, WorkspaceType type) {
        List<WorkspaceDocument> docs = (type != null)
                ? workspaceDocumentRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
                : workspaceDocumentRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return docs.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceDocumentDto createDocument(Long userId, CreateWorkspaceDocumentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        WorkspaceDocument doc = new WorkspaceDocument();
        doc.setUser(user);
        doc.setTitle(request.getTitle());
        doc.setContent(request.getContent());
        doc.setType(request.getType());
        doc.setIsCompleted(false);

        WorkspaceDocument saved = workspaceDocumentRepository.save(doc);
        return toDto(saved);
    }

    @Transactional
    public WorkspaceDocumentDto updateDocument(Long userId, Long docId, UpdateWorkspaceDocumentRequest request) {
        WorkspaceDocument doc = workspaceDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceDocument", "id", docId));

        if (!Objects.equals(doc.getUser().getId(), userId)) {
            throw new UnauthorizedAccessException("Cannot update a private workspace document belonging to another user.");
        }

        doc.setTitle(request.getTitle());
        doc.setContent(request.getContent());
        if (request.getType() != null) {
            doc.setType(request.getType());
        }
        if (request.getIsCompleted() != null) {
            doc.setIsCompleted(request.getIsCompleted());
        }

        WorkspaceDocument saved = workspaceDocumentRepository.save(doc);
        return toDto(saved);
    }

    @Transactional
    public WorkspaceDocumentDto toggleTaskCompletion(Long userId, Long docId) {
        WorkspaceDocument doc = workspaceDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceDocument", "id", docId));

        if (!Objects.equals(doc.getUser().getId(), userId)) {
            throw new UnauthorizedAccessException("Cannot modify a private workspace document belonging to another user.");
        }

        doc.setIsCompleted(!Boolean.TRUE.equals(doc.getIsCompleted()));
        WorkspaceDocument saved = workspaceDocumentRepository.save(doc);
        return toDto(saved);
    }

    @Transactional
    public void deleteDocument(Long userId, Long docId) {
        WorkspaceDocument doc = workspaceDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkspaceDocument", "id", docId));

        if (!Objects.equals(doc.getUser().getId(), userId)) {
            throw new UnauthorizedAccessException("Cannot delete a private workspace document belonging to another user.");
        }

        workspaceDocumentRepository.delete(doc);
    }

    private WorkspaceDocumentDto toDto(WorkspaceDocument d) {
        WorkspaceDocumentDto dto = new WorkspaceDocumentDto();
        dto.setId(d.getId());
        dto.setUserId(d.getUser().getId());
        dto.setTitle(d.getTitle());
        dto.setContent(d.getContent());
        dto.setType(d.getType());
        dto.setIsCompleted(d.getIsCompleted());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }
}
