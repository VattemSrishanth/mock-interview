package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity representing a structured campus placement drive track or mock interview track for a target company.
 */
@Entity
@Table(name = "placement_drive_tracks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDriveTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 50)
    private String companySlug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PlacementCompanyTier tier;

    @Column(nullable = false, length = 100)
    private String targetRole;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer totalRounds;

    @Column(length = 255)
    private String primaryTechStack;

    @Column(nullable = false)
    private Double minimumCutoffScore;

    @Column(nullable = false)
    private Boolean active;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
    }
}
