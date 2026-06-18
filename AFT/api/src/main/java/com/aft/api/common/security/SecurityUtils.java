package com.aft.api.common.security;

import com.aft.api.common.exception.UnauthorizedException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID currentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !(auth.getPrincipal() instanceof UUID id)) {
            throw new UnauthorizedException("Kimlik doğrulanamadı");
        }
        return id;
    }
}
