package com.aft.api.step.dto;

import com.aft.common.enums.ActionType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record StepResponse(
        UUID id, int stepOrder, ActionType action,
        Map<String, String> selectors, String value, UUID includedScenarioId, String includedScenarioName, Instant createdAt
) {}