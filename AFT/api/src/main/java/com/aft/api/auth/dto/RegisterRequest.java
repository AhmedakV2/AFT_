package com.aft.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email String email,
        @NotBlank String username,
        @Size(min = 8) String password,
        String phone ) {}
