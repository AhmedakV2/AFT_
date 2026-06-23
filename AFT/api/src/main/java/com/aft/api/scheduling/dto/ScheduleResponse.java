package com.aft.api.scheduling.dto;

import java.time.Instant;
import java.util.UUID;

public record ScheduleResponse(UUID id, String cron, boolean active, Instant nextFireAt,Instant lastFireAt) {
}
