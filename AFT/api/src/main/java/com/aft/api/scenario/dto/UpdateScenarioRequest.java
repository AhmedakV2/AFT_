package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateScenarioRequest(
        @NotNull String name , String description , @NotNull ScenarioStatus status
) {}
