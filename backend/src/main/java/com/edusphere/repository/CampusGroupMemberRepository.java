package com.edusphere.repository;

import com.edusphere.entity.CampusGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampusGroupMemberRepository extends JpaRepository<CampusGroupMember, Long> {

    Optional<CampusGroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    List<CampusGroupMember> findByGroupIdOrderByMemberRoleAscJoinedAtAsc(Long groupId);

    void deleteByGroupIdAndUserId(Long groupId, Long userId);

    /**
     * Count members in a group.
     */
    long countByGroupId(Long groupId);
}
