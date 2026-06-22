package com.aft.api.ingestion.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record IngestStepsRequest(
        @NotEmpty(message = "adımlar lislesi boş olamaz")
        @Size(max=1000,message = "Tek kayitta maximum 1000 kayıt gönderilebilir")
        @Valid
        List<IngestStepItem> steps,
        Boolean replaceExisting
) {}
