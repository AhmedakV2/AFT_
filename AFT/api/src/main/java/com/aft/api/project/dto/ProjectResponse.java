package com.aft.api.project.dto;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
        UUID id, String name, String description,
        String baseUrl, String cardColor, Instant createdAt
        ) {}
