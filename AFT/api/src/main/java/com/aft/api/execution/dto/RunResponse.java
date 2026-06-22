package com.aft.api.execution.dto;

import com.aft.common.enums.RunStatus;

import java.util.UUID;

public record RunResponse(
        UUID testRunId , RunStatus status , int totalSteps
) {}
