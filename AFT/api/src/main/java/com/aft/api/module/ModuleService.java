package com.aft.api.module;

import com.aft.common.domain.Module;
import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.module.dto.CreateModuleRequest;
import com.aft.api.module.dto.ModuleResponse;
import com.aft.api.module.dto.UpdateModuleRequest;
import com.aft.common.domain.Project;
import com.aft.common.repository.ModuleRepository;
import com.aft.common.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ProjectRepository projects;
    private final ModuleRepository modules;
    private final ModuleMapper mapper;

    public Page<ModuleResponse> list(Pageable pageable){
        UUID userId = SecurityUtils.currentUserId();
        return modules.findByProject_User_Id(userId, pageable).map(mapper::toResponse);
    }

    public Page<ModuleResponse> listByProject(UUID projectId, Pageable pageable){
        UUID userId = SecurityUtils.currentUserId();
        return modules.findByProject_IdAndProject_User_Id(projectId, userId, pageable).map(mapper::toResponse);
    }

    public ModuleResponse get(UUID id) {
        return mapper.toResponse(findOwned(id));
    }

    @Transactional
    public ModuleResponse create(UUID projectId, CreateModuleRequest req) {
        Project project = projects.findByIdAndUserId(projectId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Proje bulunamadı"));
        Module saved = modules.save(Module.builder()
                .project(project)
                .name(req.name())
                .description(req.description())
                .build());
        return mapper.toResponse(saved);
    }

    @Transactional
    public ModuleResponse update(UUID id, UpdateModuleRequest req) {
        Module m = findOwned(id);
        m.setName(req.name());
        m.setDescription(req.description());
        return mapper.toResponse(m);
    }

    public Page<ModuleResponse> search(String query, Pageable pageable) {
        UUID userId = SecurityUtils.currentUserId();
        return modules.findByProject_User_IdAndNameContainingIgnoreCase(userId, query, pageable)
                .map(mapper::toResponse);
    }

    @Transactional
    public void delete(UUID id) {
        modules.deleteById(id);
    }

    private Module findOwned(UUID id){
        return modules.findByIdAndProject_User_Id(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Modül bulunamadı"));
    }
}