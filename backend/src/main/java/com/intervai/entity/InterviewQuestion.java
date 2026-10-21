package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions", indexes = {
    @Index(name = "idx_question_interview", columnList = "interview_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false)
    private Integer questionOrder;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(length = 50)
    private String category; // Technical, Behavioral, System Design, etc.

    @Column(length = 100)
    private String targetSkill; // e.g. "React", "Spring Boot", "Communication"

    @Column(columnDefinition = "TEXT")
    private String expectedKeyPoints;

    @Column(columnDefinition = "TEXT")
    private String modelAnswer;

    @Column(columnDefinition = "TEXT")
    private String followUpQuestion;

    @Column(columnDefinition = "TEXT")
    private String followUpExpectedPoints;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Answer answer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
