package com.aft.common.repository;

import com.aft.common.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken>  findByTokenHashAndRevokedFalse(String tokenHash);

    @Modifying
    @Transactional
    @Query("update RefreshToken r set r.revoked = true where user r.user.id=:userId")
    void revokedAllFromUser(UUID userId);
}
