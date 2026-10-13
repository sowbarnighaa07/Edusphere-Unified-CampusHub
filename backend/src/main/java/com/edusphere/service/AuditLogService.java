package com.edusphere.service;

import com.edusphere.entity.AuditLog;
import com.edusphere.entity.User;
import com.edusphere.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(User user, String userEmail, String action, String targetResource, String targetId, String details, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUser(user);
            auditLog.setUserEmail(userEmail != null ? userEmail : (user != null ? user.getEmail() : "SYSTEM"));
            auditLog.setAction(action);
            auditLog.setTargetResource(targetResource);
            auditLog.setTargetId(targetId);
            auditLog.setDetails(details);
            auditLog.setIpAddress(ipAddress);

            auditLogRepository.save(auditLog);
            log.info("AUDIT: User [{}] performed [{}] on [{}:{}]", auditLog.getUserEmail(), action, targetResource, targetId);
        } catch (Exception e) {
            log.error("Failed to persist audit log entry: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
