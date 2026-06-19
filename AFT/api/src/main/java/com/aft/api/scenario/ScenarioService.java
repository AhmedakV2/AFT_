package com.aft.api.scenario;

import com.aft.common.domain.Module;
import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.scenario.dto.CreateScenarioRequest;
import com.aft.api.scenario.dto.ScenarioResponse;
import com.aft.api.scenario.dto.UpdateScenarioRequest;
import com.aft.common.domain.Scenario;
import com.aft.common.enums.ScenarioStatus;
import com.aft.common.repository.ModuleRepository;
import com.aft.common.repository.ScenarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ModuleRepository modules;
    private final ScenarioRepository scenarios;
    private final ScenarioMapper mapper;

    public Page<ScenarioResponse> list(Pageable pageable) {
        UUID userId = SecurityUtils.currentUserId();
        return scenarios.findByModule_Project_User_Id(userId, pageable).map(mapper::toResponse);
    }

    public ScenarioResponse get(UUID scenarioId) { return mapper.toResponse(findOwned(scenarioId)); }

    @Transactional
    public ScenarioResponse create(UUID moduleId, CreateScenarioRequest req) {
        Module module = modules.findByIdAndProject_User_Id(moduleId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Module bulunamadı"));
        Scenario saved = scenarios.save(Scenario.builder()
                .module(module)
                .name(req.name())
                .description(req.description())
                .status(ScenarioStatus.DRAFT)
                .build());
        return mapper.toResponse(saved);
    }

    @Transactional
    public ScenarioResponse update(UUID id, UpdateScenarioRequest req) {
        Scenario s = findOwned(id);
        s.setName(req.name());
        s.setDescription(req.description());
        return mapper.toResponse(s);
    }

    @Transactional
    public ScenarioResponse changeStatus(UUID id, ScenarioStatus status) {
        Scenario s = findOwned(id);
        s.setStatus(status);
        return mapper.toResponse(s);
    }

    @Transactional
    public void delete(UUID id) {
        scenarios.delete(findOwned(id));
    }

    private Scenario findOwned(UUID scenarioId) {
        return scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new RuntimeException("Senaryo bulunamadı"));
    }
}