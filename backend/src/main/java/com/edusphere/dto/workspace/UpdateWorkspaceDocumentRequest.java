package com.edusphere.dto.workspace;

import com.edusphere.entity.WorkspaceType;
import jakarta.validation.constraints.NotBlank;

public class UpdateWorkspaceDocumentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    private WorkspaceType type;

    private Boolean isCompleted;

    public UpdateWorkspaceDocumentRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public WorkspaceType getType() { return type; }
    public void setType(WorkspaceType type) { this.type = type; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean completed) { isCompleted = completed; }
}
