package com.aft.common.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken extends BaseEntity{

    @ManyToOne(fetch= FetchType.LAZY,optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "token_hash",nullable = false)
    private String tokenHash;

    @Column(name = "expires_at",nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;


}
