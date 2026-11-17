package com.intervai.repository;

import com.intervai.entity.UserCreditWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCreditWalletRepository extends JpaRepository<UserCreditWallet, Long> {
    Optional<UserCreditWallet> findByUserId(Long userId);
    Optional<UserCreditWallet> findByReferralCode(String referralCode);
    boolean existsByReferralCode(String referralCode);
    long countByReferredByCode(String referredByCode);
}
