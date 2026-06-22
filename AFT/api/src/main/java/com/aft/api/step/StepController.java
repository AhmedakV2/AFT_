package com.aft.api.step;

import com.aft.api.common.ApiResponse;
import com.aft.api.step.dto.StepResponse;
import com.aft.api.step.dto.UpdateStepRequest;
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

    @GetMapping("/steps")
    public ApiResponse<List<StepResponse>> list(@PathVariable UUID scenarioId){
        return ApiResponse.ok(service.listByScenario(scenarioId));
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
