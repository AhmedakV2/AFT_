package com.aft.api.scenario;


import com.aft.api.common.ApiResponse;
import com.aft.api.scenario.dto.ChangeStatusRequest;
import com.aft.api.scenario.dto.CreateScenarioRequest;
import com.aft.api.scenario.dto.ScenarioResponse;
import com.aft.api.scenario.dto.UpdateScenarioRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scenarios")
@RequiredArgsConstructor
public class ScenarioControl {
    private final ScenarioService service;

    @GetMapping
    public ApiResponse<Page<ScenarioResponse>> list (Pageable pageable) {return ApiResponse.ok(service.list(pageable));}

    @GetMapping("/{id}")
    public ApiResponse<ScenarioResponse> get(@PathVariable UUID id) {return ApiResponse.ok(service.get(id));}

    @PostMapping
    public ApiResponse<ScenarioResponse> create(@RequestBody UUID moduleId ,CreateScenarioRequest req){
        return ApiResponse.ok(service.create(moduleId,req));
    }

    @PutMapping("/{id}")
    public ApiResponse<ScenarioResponse> update(@PathVariable UUID id ,@Valid @RequestBody UpdateScenarioRequest req){
        return ApiResponse.ok(service.update(id, req));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ScenarioResponse> changeStatus(@PathVariable UUID id,
                                                      @RequestBody ChangeStatusRequest req) {
        return ApiResponse.ok(service.changeStatus(id, req.status()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok("Senaryo silindi");
    }
}
