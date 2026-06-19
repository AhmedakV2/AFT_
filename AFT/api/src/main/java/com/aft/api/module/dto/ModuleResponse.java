package com.aft.api.module.dto;

import java.time.Instant;
import java.util.UUID;

public record ModuleResponse(

        UUID id,String name,String description, Instant createdAt
) {}
