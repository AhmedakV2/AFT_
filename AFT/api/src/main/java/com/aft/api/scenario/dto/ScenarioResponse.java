package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;

import java.time.Instant;
import java.util.UUID;

public record ScenarioResponse(
        UUID id, String name, String description, ScenarioStatus status, Instant createdAt
) {}
