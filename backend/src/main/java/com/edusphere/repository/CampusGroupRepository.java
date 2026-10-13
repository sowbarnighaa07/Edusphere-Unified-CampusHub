package com.edusphere.repository;

import com.edusphere.entity.CampusGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusGroupRepository extends JpaRepository<CampusGroup, Long> {

    /**
     * All active groups that a given user is a member of.
     */
    @Query("SELECT g FROM CampusGroup g " +
           "JOIN CampusGroupMember m ON m.group = g " +
           "WHERE m.user.id = :userId AND g.isActive = true " +
           "ORDER BY g.createdAt DESC")
    List<CampusGroup> findGroupsByUserId(@Param("userId") Long userId);

    boolean existsByIdAndIsActive(Long id, Boolean isActive);
}
