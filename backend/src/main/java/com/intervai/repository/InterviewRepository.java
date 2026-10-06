package com.intervai.repository;

import com.intervai.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Interview> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
    Long countByUserId(Long userId);
    Long countByUserIdAndStatus(Long userId, String status);

    @Query("SELECT AVG(i.overallScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAverageScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(i.overallScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Integer findMaxScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(i.technicalKnowledgeScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAvgTechnicalScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(i.communicationScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAvgCommunicationScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(i.relevanceScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAvgRelevanceScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(i.clarityScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAvgClarityScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(i.confidenceScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAvgConfidenceScoreByUserId(@Param("userId") Long userId);

    List<Interview> findAllByOrderByCreatedAtDesc();
}
