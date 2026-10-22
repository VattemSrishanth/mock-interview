package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_user", columnList = "user_id"),
    @Index(name = "idx_interview_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String jobRole;

    @Column(nullable = false, length = 50)
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String skills; // JSON array or comma separated

    @Column(nullable = false, length = 50)
    private String interviewType; // Technical, Behavioral, HR, Mixed, System Design

    @Column(nullable = false, length = 30)
    private String difficulty; // Easy, Medium, Hard, Expert

    @Column(nullable = false)
    private Integer numberOfQuestions;

    @Column(nullable = false, length = 20)
    private String interviewMode; // Text, Voice

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "CREATED"; // CREATED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(length = 40)
    @Builder.Default
    private String interviewSource = "PRESET"; // PRESET, RESUME, JOB_DESCRIPTION, RESUME_AND_JD

    @Column
    @Builder.Default
    private Boolean enableAdaptiveFollowUp = true;

    private Integer overallScore;
    private Integer technicalKnowledgeScore;
    private Integer communicationScore;
    private Integer relevanceScore;
    private Integer clarityScore;
    private Integer confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String summaryFeedback;

    @Column(columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(unique = true, length = 64)
    private String shareToken;

    @Column
    @Builder.Default
    private Boolean isPubliclyShared = false;

    private Integer durationSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("questionOrder ASC")
    @Builder.Default
    private List<InterviewQuestion> questions = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
