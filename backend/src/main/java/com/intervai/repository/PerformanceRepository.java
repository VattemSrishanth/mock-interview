package com.intervai.repository;

import com.intervai.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByUserIdOrderByScoreDesc(Long userId);
    Optional<Performance> findByUserIdAndSkillNameIgnoreCase(Long userId, String skillName);
}
