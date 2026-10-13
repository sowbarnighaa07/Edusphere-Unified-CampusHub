package com.edusphere.dto.group;

/**
 * Request body for sending a message to a group.
 */
public class SendMessageRequest {
    private String content;

    public SendMessageRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
