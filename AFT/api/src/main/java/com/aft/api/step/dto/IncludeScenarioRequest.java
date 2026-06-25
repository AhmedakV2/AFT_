package com.aft.api.step.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record IncludeScenarioRequest(@NotNull UUID includedScenarioId) {}
