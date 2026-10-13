package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.entity.Department;
import com.edusphere.entity.Section;
import com.edusphere.repository.DepartmentRepository;
import com.edusphere.repository.SectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
public class PublicController {

    private final DepartmentRepository departmentRepository;
    private final SectionRepository sectionRepository;

    public PublicController(DepartmentRepository departmentRepository, SectionRepository sectionRepository) {
        this.departmentRepository = departmentRepository;
        this.sectionRepository = sectionRepository;
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDepartments() {
        List<Map<String, Object>> result = departmentRepository.findAll().stream()
                .map(d -> Map.of(
                        "id", (Object) d.getId(),
                        "name", d.getName(),
                        "code", d.getCode()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/sections")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSectionsByDepartment(@RequestParam Long departmentId) {
        List<Map<String, Object>> result = sectionRepository.findByDepartmentId(departmentId).stream()
                .map(s -> Map.of(
                        "id", (Object) s.getId(),
                        "name", s.getName(),
                        "departmentId", s.getDepartment().getId()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
