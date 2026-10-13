package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.workspace.CreateWorkspaceDocumentRequest;
import com.edusphere.dto.workspace.UpdateWorkspaceDocumentRequest;
import com.edusphere.dto.workspace.WorkspaceDocumentDto;
import com.edusphere.entity.WorkspaceType;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspace")
@PreAuthorize("isAuthenticated()")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceDocumentDto>>> getMyDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) WorkspaceType type) {
        List<WorkspaceDocumentDto> docs = workspaceService.getMyDocuments(userPrincipal.getId(), type);
        return ResponseEntity.ok(ApiResponse.success(docs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceDocumentDto>> createDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateWorkspaceDocumentRequest request) {
        WorkspaceDocumentDto created = workspaceService.createDocument(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Document saved to personal workspace.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceDocumentDto>> updateDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkspaceDocumentRequest request) {
        WorkspaceDocumentDto updated = workspaceService.updateDocument(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Workspace document updated.", updated));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<WorkspaceDocumentDto>> toggleTaskCompletion(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        WorkspaceDocumentDto updated = workspaceService.toggleTaskCompletion(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Task status updated.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        workspaceService.deleteDocument(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.successMessage("Document deleted from workspace."));
    }
}
