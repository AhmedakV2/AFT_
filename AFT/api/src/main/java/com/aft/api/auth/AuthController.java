package com.aft.api.auth;

import com.aft.api.auth.dto.*;
import com.aft.api.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;


    @PostMapping("/register")
    public ApiResponse<String> register (@Valid @RequestBody RegisterRequest req){
        authService.register(req);
        return ApiResponse.ok("Onay kodu epostanıza gönderildi");
    };

    @PostMapping("/verify-email")
    public ApiResponse<String> verify(@Valid @RequestBody VerifyEmailRequest req){
        authService.verifyEmail(req);
        return ApiResponse.ok("E-posta doğrulandı");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req){
        return ApiResponse.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh (@Valid @RequestBody RefreshRequest req){
        return ApiResponse.ok(authService.refresh(req));
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(@Valid @RequestBody RefreshRequest req) {
        authService.logout(req);
        return ApiResponse.ok("Çıkış yapıldı");
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest req) {
        return ApiResponse.ok(googleAuthService.login(req.idToken()));
    }
}
