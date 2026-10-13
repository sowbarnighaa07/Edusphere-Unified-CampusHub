package com.edusphere.controller;

import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.excel.ExcelConfirmRequest;
import com.edusphere.dto.excel.ExcelPreviewResponse;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.ExcelImportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Phase 8 — Excel Import Controller
 *
 * Endpoints:
 *   POST /api/staff/excel/preview  — Upload, parse, validate, return preview (NO DB write)
 *   POST /api/staff/excel/confirm  — Commit valid rows to MySQL (@Transactional)
 *
 * Both endpoints require STAFF, HOD, or ADMIN role.
 * Staff can only operate on their own TeachingAssignments (enforced in service).
 */
@RestController
@RequestMapping("/staff/excel")
@PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
public class ExcelImportController {

    private final ExcelImportService excelImportService;

    public ExcelImportController(ExcelImportService excelImportService) {
        this.excelImportService = excelImportService;
    }

    /**
     * Phase A — Upload, Parse, Validate.
     * Returns a preview JSON with per-row status and an importToken.
     * Nothing is written to the database.
     *
     * Required form-data params:
     *   file                 — .xlsx file
     *   teachingAssignmentId — Long
     *   importType           — ATTENDANCE | IAT1 | IAT2
     */
    @PostMapping(value = "/preview", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ExcelPreviewResponse>> preview(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teachingAssignmentId") Long teachingAssignmentId,
            @RequestParam("importType") String importType,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ExcelPreviewResponse response = excelImportService.preview(
                userPrincipal.getId(),
                userPrincipal.getRole(),
                teachingAssignmentId,
                importType,
                file);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Phase B — Confirm and Commit.
     * Looks up the import token from cache, writes all valid rows to MySQL.
     * The entire operation is wrapped in @Transactional inside the service.
     */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirm(
            @Valid @RequestBody ExcelConfirmRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Map<String, Object> result = excelImportService.confirm(
                userPrincipal.getId(),
                userPrincipal.getRole(),
                request);

        return ResponseEntity.ok(ApiResponse.success("Import completed successfully.", result));
    }
}
