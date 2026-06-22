package com.aft.api.execution;

import com.aft.api.common.ApiResponse;
import com.aft.api.execution.dto.RunResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scenarios/{scenarioId}")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/run")
    public ApiResponse<RunResponse> run(@PathVariable UUID scenarioId) {
        return ApiResponse.ok(executionService.trigger(scenarioId));
    }
}
