package com.edusphere.repository;

import com.edusphere.entity.Achievement;
import com.edusphere.entity.AchievementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByStudentIdOrderByAchievementDateDesc(Long studentId);
    List<Achievement> findByStatusOrderByAchievementDateDesc(AchievementStatus status);
    List<Achievement> findByStudentDepartmentIdAndStatusOrderByAchievementDateDesc(Long departmentId, AchievementStatus status);
}
