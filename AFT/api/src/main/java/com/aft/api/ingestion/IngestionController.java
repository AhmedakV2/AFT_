package com.aft.api.ingestion;

import com.aft.api.common.ApiResponse;
import com.aft.api.ingestion.dto.IngestResultResponse;
import com.aft.api.ingestion.dto.IngestStepsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scenarios/{scenarioId}/steps")
@RequiredArgsConstructor
public class IngestionController {

    private final IngestionService ingestionService;


    @PostMapping("ingest")
    public ApiResponse<IngestResultResponse> ingest(@PathVariable UUID scenarioId, @Valid @RequestBody IngestStepsRequest req) {
        return ApiResponse.ok(ingestionService.ingest(scenarioId, req));
    }
}
