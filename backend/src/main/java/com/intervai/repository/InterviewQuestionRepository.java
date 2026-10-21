package com.intervai.repository;

import com.intervai.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    @EntityGraph(attributePaths = {"answer", "answer.feedback"})
    List<InterviewQuestion> findByInterviewIdOrderByQuestionOrderAsc(Long interviewId);
    Optional<InterviewQuestion> findByInterviewIdAndQuestionOrder(Long interviewId, Integer questionOrder);
    Long countByInterviewId(Long interviewId);
}
