package com.edusphere.repository;

import com.edusphere.entity.CampusGroupMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CampusGroupMessageRepository extends JpaRepository<CampusGroupMessage, Long> {

    /**
     * Load paginated message history for a group, newest first (for display we'll reverse on the frontend).
     */
    List<CampusGroupMessage> findByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    /**
     * Count unread messages: messages sent after lastReadAt by other users.
     */
    @Query("SELECT COUNT(m) FROM CampusGroupMessage m " +
           "WHERE m.group.id = :groupId " +
           "AND m.sender.id != :userId " +
           "AND (:lastReadAt IS NULL OR m.createdAt > :lastReadAt)")
    long countUnreadMessages(@Param("groupId") Long groupId,
                              @Param("userId") Long userId,
                              @Param("lastReadAt") LocalDateTime lastReadAt);

    /**
     * Latest message in a group (for preview in sidebar).
     */
    @Query("SELECT m FROM CampusGroupMessage m WHERE m.group.id = :groupId ORDER BY m.createdAt DESC")
    List<CampusGroupMessage> findLatestByGroupId(@Param("groupId") Long groupId, Pageable pageable);
}
