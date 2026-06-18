package com.aft.common.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "email_verifications")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class EmailVerification extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String code;

    @Column(name="expires_at",nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean consumed;
}
