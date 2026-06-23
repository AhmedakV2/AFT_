package com.aft.api.scheduling.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateScheduleRequest(@NotBlank String cron) {
}
