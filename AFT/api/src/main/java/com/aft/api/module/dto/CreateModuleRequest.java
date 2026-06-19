package com.aft.api.module.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateModuleRequest(
        @NotBlank String name ,String description
) {
}
