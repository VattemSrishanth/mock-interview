package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private Answer answer;

    private Integer score;
    private Integer technicalKnowledgeScore;
    private Integer communicationScore;
    private Integer relevanceScore;
    private Integer clarityScore;
    private Integer confidenceScore;

    @Column(length = 24)
    private String evaluationSource;

    @Column(columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(columnDefinition = "TEXT")
    private String suggestionsJson;

    @Column(columnDefinition = "TEXT")
    private String modelAnswer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
