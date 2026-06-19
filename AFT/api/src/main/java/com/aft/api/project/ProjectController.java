package com.aft.api.project;

import com.aft.api.common.ApiResponse;
import com.aft.api.project.dto.CreateProjectRequest;
import com.aft.api.project.dto.ProjectResponse;
import com.aft.api.project.dto.UpdateProjectRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    @GetMapping
    public ApiResponse<Page<ProjectResponse>> list(Pageable pageable){
        return ApiResponse.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> get(@PathVariable UUID id){
        return ApiResponse.ok(service.get(id));
    }

    @PostMapping
    public ApiResponse<ProjectResponse> create(@RequestBody CreateProjectRequest req){
        return ApiResponse.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateProjectRequest req){
        return ApiResponse.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable UUID id){
        service.delete(id);
        return ApiResponse.ok("Proje silindi");
    }


}
