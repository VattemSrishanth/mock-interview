package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_credit_wallets", indexes = {
    @Index(name = "idx_wallet_referral_code", columnList = "referralCode")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreditWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private Integer creditsBalance = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer freeInterviewsRemaining = 1;

    @Column(unique = true, length = 32)
    private String referralCode;

    @Column(length = 32)
    private String referredByCode;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalInterviewsCompleted = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public int getTotalAvailableInterviews() {
        return (freeInterviewsRemaining != null ? freeInterviewsRemaining : 0) +
               (creditsBalance != null ? creditsBalance : 0);
    }
}
