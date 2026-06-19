package com.aft.api.common.security;

import com.aft.api.config.AftProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.time.Instant;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTtlMinutes;

    public JwtService(AftProperties props){
        this.key= Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.jwt().secret()));
        this.accessTtlMinutes=props.jwt().accessTtlMinutes();
    }

    public String generateAccessToken(UUID userId,String email){
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email",email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlMinutes*60)))
                .signWith(key)
                .compact();
    }
    public UUID extractUserId(String token){
        String sub = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
        return UUID.fromString(sub);
    }

    public boolean isValid(String token){
        try{
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        }
        catch(Exception e){
            return false;
        }
    }

}
