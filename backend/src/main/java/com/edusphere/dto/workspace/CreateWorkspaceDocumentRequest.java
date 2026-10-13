package com.edusphere.dto.workspace;

import com.edusphere.entity.WorkspaceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateWorkspaceDocumentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    @NotNull(message = "Document type is required (NOTE or TASK)")
    private WorkspaceType type;

    public CreateWorkspaceDocumentRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public WorkspaceType getType() { return type; }
    public void setType(WorkspaceType type) { this.type = type; }
}
