package com.edusphere.controller;

import com.edusphere.dto.admin.AdminMonitoringDto;
import com.edusphere.dto.admin.AdminReportsDto;
import com.edusphere.dto.admin.AuditLogDto;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.dto.common.PagedResponse;
import com.edusphere.entity.Role;
import com.edusphere.service.AdminMonitoringService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMonitoringController {

    private final AdminMonitoringService adminMonitoringService;

    public AdminMonitoringController(AdminMonitoringService adminMonitoringService) {
        this.adminMonitoringService = adminMonitoringService;
    }

    /**
     * 1. Live Institution Monitoring Dashboard Data
     */
    @GetMapping("/monitoring")
    public ResponseEntity<ApiResponse<AdminMonitoringDto>> getCampusMonitoring() {
        AdminMonitoringDto monitoring = adminMonitoringService.getCampusMonitoring();
        return ResponseEntity.ok(ApiResponse.success(monitoring));
    }

    /**
     * 2. Report-Ready Institution Data
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<AdminReportsDto>> getCampusReports() {
        AdminReportsDto reports = adminMonitoringService.getCampusReports();
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    /**
     * 3. Filtered Audit Logs with Pagination
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        PagedResponse<AuditLogDto> pagedLogs = adminMonitoringService.getFilteredAuditLogs(
                role, action, ipAddress, from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(pagedLogs));
    }
}
