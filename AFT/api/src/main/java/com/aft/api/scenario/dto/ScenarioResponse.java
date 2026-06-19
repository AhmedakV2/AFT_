package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;

import java.time.Instant;

public record ScenarioResponse(
        String name,String description, ScenarioStatus status, Instant createdAt
) {}
