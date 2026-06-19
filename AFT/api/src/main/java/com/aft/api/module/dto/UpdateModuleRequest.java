package com.aft.api.module.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateModuleRequest(
        @NotBlank String name , String description
) {}
