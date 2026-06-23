package com.aft.api.report.dto;

import com.aft.common.enums.RunStatus;

import java.time.Instant;
import java.util.UUID;

public record RunSummary(
        UUID testRunId , RunStatus status,
        int totalSteps, int passedSteps,
        Instant startedAt, Instant finishedAt
        ) {
}
