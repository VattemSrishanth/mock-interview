package com.intervai.repository;

import com.intervai.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByUserIdOrderByScoreDesc(Long userId);
    Optional<Performance> findByUserIdAndSkillNameIgnoreCase(Long userId, String skillName);

    @Query("SELECT f.score FROM Feedback f WHERE f.score IS NOT NULL AND f.answer.question.interview.user.id = :userId AND LOWER(f.answer.question.targetSkill) = LOWER(:skillName)")
    List<Integer> findScoresByUserIdAndSkillNameIgnoreCase(@Param("userId") Long userId, @Param("skillName") String skillName);
}
