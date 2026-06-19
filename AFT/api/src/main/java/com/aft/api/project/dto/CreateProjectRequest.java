package com.aft.api.project.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(
        @NotBlank String name,String description,
        @NotBlank String baseUrl,@NotBlank String cardColor
) {}
