package com.aft.common.repository;

import com.aft.common.domain.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    Optional<EmailVerification> findTopByUserIdAndConsumedFalseOrderByCreatedAtDesc(UUID userId);
}
