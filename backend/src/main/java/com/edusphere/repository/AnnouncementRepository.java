package com.edusphere.repository;

import com.edusphere.entity.Announcement;
import com.edusphere.entity.AnnouncementScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByScopeOrderByCreatedAtDesc(AnnouncementScope scope);
    List<Announcement> findByScopeOrDepartmentIdOrderByCreatedAtDesc(AnnouncementScope scope, Long departmentId);
    List<Announcement> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
