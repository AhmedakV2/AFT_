package com.aft.api.ingestion.dto;

import java.util.UUID;

public record IngestResultResponse(UUID scenarioId,int savedCount,boolean replaced) {}
