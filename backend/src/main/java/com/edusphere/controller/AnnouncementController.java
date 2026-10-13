package com.edusphere.controller;

import com.edusphere.dto.announcement.AnnouncementDto;
import com.edusphere.dto.announcement.CreateAnnouncementRequest;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    /**
     * Get announcements visible to current authenticated user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getAnnouncements(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AnnouncementDto> announcements = announcementService.getAnnouncementsForUser(
                userPrincipal.getId(), userPrincipal.getRole());
        return ResponseEntity.ok(ApiResponse.success(announcements));
    }

    /**
     * Create announcement with backend target validation
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        AnnouncementDto created = announcementService.createAnnouncement(
                userPrincipal.getId(), userPrincipal.getRole(), request);
        return ResponseEntity.ok(ApiResponse.success("Announcement published successfully.", created));
    }

    /**
     * Delete announcement (creator or Admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'HOD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        announcementService.deleteAnnouncement(userPrincipal.getId(), userPrincipal.getRole(), id);
        return ResponseEntity.ok(ApiResponse.successMessage("Announcement deleted successfully."));
    }
}
