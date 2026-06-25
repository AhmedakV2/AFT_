package com.aft.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String phone;

    @Column(nullable = false,unique = true)
    private String username;

    @Column(name= "password_hash")
    private String passwordHash;

    @Column(name = "email_verified",nullable = false)
    private boolean emailVerified;

}