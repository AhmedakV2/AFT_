package com.aft.api.module;

import com.aft.api.common.ApiResponse;
import com.aft.api.module.dto.CreateModuleRequest;
import com.aft.api.module.dto.ModuleResponse;
import com.aft.api.module.dto.UpdateModuleRequest;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService service;

    @GetMapping
    public ApiResponse<Page<ModuleResponse>> list(Pageable pageable) {return ApiResponse.ok(service.list(pageable));}

    @GetMapping("/{id}")
    public ApiResponse<ModuleResponse> get(@PathVariable UUID id) { return ApiResponse.ok(service.get(id));}

    @GetMapping("/search")
    public ApiResponse<Page<ModuleResponse>> search(@RequestParam String query, Pageable pageable) {
        return ApiResponse.ok(service.search(query, pageable));
    }

    @PostMapping
    public ApiResponse<ModuleResponse> create(@RequestParam UUID projectId,
                                              @Valid @RequestBody CreateModuleRequest req) {
        return ApiResponse.ok(service.create(projectId, req));
    }

    @PutMapping("/{id}")
    public ApiResponse<ModuleResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateModuleRequest req) {
        return ApiResponse.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok("Modül silindi");
    }

}
