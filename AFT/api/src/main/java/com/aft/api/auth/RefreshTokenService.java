package com.aft.api.auth;

import com.aft.api.common.exception.UnauthorizedException;
import com.aft.api.config.AftProperties;
import com.aft.common.domain.RefreshToken;
import com.aft.common.domain.User;
import com.aft.common.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {


    private final RefreshTokenRepository repo;
    private final AftProperties props;

    public String issue(User user){
        String raw = UUID.randomUUID().toString() + UUID.randomUUID();
        repo.save(RefreshToken.builder()
                .user(user)
                .tokenHash(hash(raw))
                .expiresAt(Instant.now().plusSeconds(props.jwt().refreshTtlDays()*86400))
                .revoked(false)
                .build());
        return raw;
    }

    @Transactional
    public RotationResult  rotate(String rawToken) {
        RefreshToken current = repo.findByTokenHashAndRevokedFalse(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Geçersiz oturum"));
        if (current.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Oturum süresi doldu, tekrar giriş yapın");
        }
        current.setRevoked(true);
        String newRaw = issue(current.getUser());
        return new RotationResult(current.getUser(), newRaw);
    }
    public void revoke(String rawToken){
        repo.findByTokenHashAndRevokedFalse(hash(rawToken))
                .ifPresent(t->t.setRevoked(true));
    }
    private String hash(String value){
        try{
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        }catch (Exception e){
            throw new IllegalStateException(e);
        }
    }
    public record RotationResult(User user, String newRefreshRawToken) {}
}
