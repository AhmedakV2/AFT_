package com.aft.api.scenario.dto;

import com.aft.common.enums.ScenarioStatus;
import jakarta.validation.constraints.NotBlank;

public record ChangeStatusRequest(
        @NotBlank ScenarioStatus status
) {}
