package com.aft.api.ingestion.dto;

import com.aft.common.enums.ActionType;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record IngestStepItem(
        @NotNull ActionType actionType,
        Map<String,String> selectors,
        String value
        ) {}
