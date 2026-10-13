package com.edusphere.dto.group;

/**
 * Request body for creating a new campus group.
 */
public class CreateGroupRequest {
    private String name;
    private String description;
    private String groupType;   // ACADEMIC, PROJECT, DEPARTMENT, INSTITUTIONAL, CLUB, OTHER

    public CreateGroupRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGroupType() { return groupType; }
    public void setGroupType(String groupType) { this.groupType = groupType; }
}
