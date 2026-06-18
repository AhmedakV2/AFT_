package com.aft.api.auth;

import com.aft.api.auth.dto.*;
import com.aft.api.common.exception.ConflictException;
import com.aft.api.common.exception.UnauthorizedException;
import com.aft.api.common.security.JwtService;
import com.aft.api.config.AftProperties;
import com.aft.common.domain.EmailVerification;
import com.aft.common.domain.User;
import com.aft.common.repository.EmailVerificationRepository;
import com.aft.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final EmailVerificationRepository verifications;
    private final RefreshTokenService refreshTokens;
    private final JwtService jwt;
    private final PasswordEncoder encoder;
    private final AftProperties props;


    @Transactional
    public void register(RegisterRequest req) {
        if(users.existsByEmail(req.email())) throw new ConflictException("Bu e-posta kayıtlı");
        if(users.existsByUsername(req.username())) throw new ConflictException("Bu kullanıcı adı kayıtlı");

        User user = users.save(User.builder()
                .email(req.email())
                .username(req.username())
                .phone(req.phone())
                .passwordHash(encoder.encode(req.password()))
                .emailVerified(false)
                .build());

        issueVerificationCode(user);
    }
    private void issueVerificationCode(User user) {
        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
        verifications.save(EmailVerification.builder()
                .user(user)
                .code(code)
                .expiresAt(Instant.now().plusSeconds(15*60))
                .consumed(false)
                .build());
        log.info("E-Posta onay kodu [{}] -> {}",code,user.getEmail());
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(()-> new UnauthorizedException("Kullanıcı bulunamadı"));
        EmailVerification v = verifications
                .findTopByUserIdAndConsumedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow(()-> new UnauthorizedException("Doğrulama kodu yok"));
        if(v.isConsumed() || v.getExpiresAt().isBefore(Instant.now()) || !v.getCode().equals(req.code())) {
            throw new UnauthorizedException("Kod gecersiz veya süresi dolmuş");
        }
        v.setConsumed(true);
        user.setEmailVerified(true);
    }

    public AuthResponse login (LoginRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(()-> new UnauthorizedException("Eposta veya şifre hatalı"));
        if(user.getPasswordHash()==null || !encoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Eposta veya şifre hatalı");
        }
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Önce e-postanızı doğrulayın");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        var result = refreshTokens.rotate(req.refreshToken());
        String access = jwt.generateAccessToken(result.user().getId(),result.user().getEmail());
        return new AuthResponse(access,result.newRefreshRawToken(),"Bearer",props.jwt().accessTtlMinutes()*60);
    }

    public void logout(RefreshRequest req) {
        refreshTokens.revoke(req.refreshToken());
    }
     AuthResponse buildAuthResponse(User user) {
        String access = jwt.generateAccessToken(user.getId(),user.getEmail());
        String refresh =refreshTokens.issue(user);
        return new AuthResponse(access, refresh, "Bearer", props.jwt().accessTtlMinutes() * 60);
     }
}
