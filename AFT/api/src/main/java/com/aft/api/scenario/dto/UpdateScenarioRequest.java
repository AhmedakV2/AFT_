package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;
import jakarta.validation.constraints.NotBlank;

public record UpdateScenarioRequest(
        @NotBlank String name , String description , @NotBlank ScenarioStatus status
) {}
