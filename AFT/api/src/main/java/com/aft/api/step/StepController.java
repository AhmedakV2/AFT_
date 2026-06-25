package com.aft.api.step;

import com.aft.api.common.ApiResponse;
import com.aft.api.step.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StepController {
    private final StepService service;

    @GetMapping("/scenarios/{scenarioId}/steps")
    public ApiResponse<List<StepResponse>> list(@PathVariable UUID scenarioId) {
        return ApiResponse.ok(service.listByScenario(scenarioId));
    }

    @PostMapping("/scenarios/{scenarioId}/steps/include")
    public ApiResponse<StepResponse> include(@PathVariable UUID scenarioId,@Valid @RequestBody IncludeScenarioRequest req) {
        return ApiResponse.ok(service.addInclude(scenarioId,req.includedScenarioId()));
    }

    @PatchMapping("/scenarios/{scenarioId}/steps/reorder")
    public ApiResponse<List<StepResponse>> reorder(@PathVariable UUID scenarioId, @Valid @RequestBody ReorderStepsRequest req) {
        return ApiResponse.ok(service.reorder(scenarioId, req.orderedStepIds()));
    }

    @PostMapping("/scenarios/{scenarioId}/steps")
    public ApiResponse<StepResponse> create(@PathVariable UUID scenarioId, @Valid @RequestBody CreateStepRequest req) {
        return ApiResponse.ok(service.create(scenarioId, req));
    }

    @PatchMapping("/steps/{stepId}")
    public ApiResponse<StepResponse> update(@PathVariable UUID stepId, @Valid @RequestBody UpdateStepRequest req){
        return ApiResponse.ok(service.update(stepId, req));
    }

    @DeleteMapping("/steps/{stepId}")
    public ApiResponse<String> delete(@PathVariable UUID stepId) {
        service.delete(stepId);
        return ApiResponse.ok("Adim silindi");
    }

}
