package com.aft.api.auth;

import com.aft.api.auth.dto.AuthResponse;
import com.aft.api.common.exception.UnauthorizedException;
import com.aft.api.config.AftProperties;
import com.aft.common.domain.User;
import com.aft.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository users;
    private final AuthService authService;
    private final AftProperties props;
    private volatile JwtDecoder decoder;

    @Transactional
    public AuthResponse login(String idToken){
        Jwt token = decode(idToken);
        if(!token.getAudience().contains(props.google().clientId())){
            throw new UnauthorizedException("Google token bu uygulamaya ait değil");
        }
        String email= token.getClaimAsString("email");
        if(email==null){throw new UnauthorizedException("Google token e-posta içermiyor");}

        User user = users.findByEmail(email).orElseGet(()-> users.save(User.builder()
                .email(email)
                .username(email)
                .emailVerified(true)
                .build()));
        return authService.buildAuthResponse(user);
    }

    private Jwt decode(String idToken){
        if(decoder==null){
            decoder = JwtDecoders.fromIssuerLocation("https://accounts.google.com");
        }
        try{
            return decoder.decode(idToken);
        }
        catch (Exception e){
            throw new UnauthorizedException("Google token doğrulanamadı");
        }
    }
}
