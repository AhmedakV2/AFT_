package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateScenarioRequest(
        @NotBlank String name , String description , @NotNull ScenarioStatus status
) {}
