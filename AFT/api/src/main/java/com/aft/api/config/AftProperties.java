package com.aft.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aft")
public record AftProperties(Jwt jwt, Google google) {
    public record Jwt(String secret,long accessTtlMinutes,long refreshTtlDays){}
    public record Google(String clientId){}
}
