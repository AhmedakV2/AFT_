package com.aft.api.step.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record ReorderStepsRequest(@NotEmpty List<UUID> orderedStepIds) {}