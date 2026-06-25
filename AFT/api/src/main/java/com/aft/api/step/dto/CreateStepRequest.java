package com.aft.api.step.dto;

import com.aft.common.enums.ActionType;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record CreateStepRequest(
        @NotNull ActionType action,
        Map<String, String> selectors,
        String value) {}