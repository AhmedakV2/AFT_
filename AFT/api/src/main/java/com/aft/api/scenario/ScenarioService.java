package com.aft.api.scenario;

import com.aft.api.common.exception.ApiException;
import com.aft.common.domain.Module;
import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.scenario.dto.CreateScenarioRequest;
import com.aft.api.scenario.dto.ScenarioResponse;
import com.aft.api.scenario.dto.UpdateScenarioRequest;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.Step;
import com.aft.common.enums.ActionType;
import com.aft.common.enums.ScenarioStatus;
import com.aft.common.repository.ModuleRepository;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ModuleRepository modules;
    private final ScenarioRepository scenarios;
    private final ScenarioMapper mapper;
    private final StepRepository steps;

    public Page<ScenarioResponse> list(Pageable pageable) {
        UUID userId = SecurityUtils.currentUserId();
        return withIncludedFlag(scenarios.findByModule_Project_User_Id(userId, pageable));
    }

    public Page<ScenarioResponse> listByModule(UUID moduleId, Pageable pageable) {
        UUID userId = SecurityUtils.currentUserId();
        return withIncludedFlag(scenarios.findByModule_IdAndModule_Project_User_Id(moduleId, userId, pageable));
    }

    public ScenarioResponse get(UUID scenarioId) {
        Scenario s = findOwned(scenarioId);
        return mapper.toResponse(s, steps.countByIncludedScenarioId(scenarioId) > 0);
    }

    @Transactional(readOnly = true)
    public Page<ScenarioResponse> inheritable(UUID projectId, UUID excludeScenarioId, Pageable pageable) {
        UUID userId = SecurityUtils.currentUserId();
        return scenarios.findByModule_Project_IdAndIdNotAndModule_Project_User_Id(
                projectId,
                excludeScenarioId,
                userId,
                pageable
        ).map(mapper::toResponse);
    }

    @Transactional
    public ScenarioResponse create(UUID moduleId, CreateScenarioRequest req) {
        UUID userId = SecurityUtils.currentUserId();
        Module module = modules.findByIdAndProject_User_Id(moduleId, userId)
                .orElseThrow(() -> new NotFoundException("Modül bulunamadı"));

        Scenario saved = scenarios.save(Scenario.builder()
                .module(module)
                .name(req.name())
                .description(req.description())
                .status(req.status() != null ? req.status() : ScenarioStatus.DRAFT)
                .build());

        String baseUrl = module.getProject().getBaseUrl();
        if (baseUrl != null && !baseUrl.isBlank()) {
            steps.save(Step.builder()
                    .scenario(saved)
                    .stepOrder(1)
                    .action(ActionType.NAVIGATE)
                    .value(baseUrl)
                    .selectors(java.util.Map.of())
                    .build());
        }
        return mapper.toResponse(saved, false);

    }

    @Transactional
    public ScenarioResponse update(UUID id, UpdateScenarioRequest req) {
        Scenario s = findOwned(id);
        s.setName(req.name());
        s.setDescription(req.description());
        return mapper.toResponse(s, steps.countByIncludedScenarioId(id) > 0);
    }

    @Transactional
    public ScenarioResponse changeStatus(UUID id, ScenarioStatus status) {
        Scenario s = findOwned(id);
        s.setStatus(status);
        return mapper.toResponse(s, steps.countByIncludedScenarioId(id) > 0);
    }

    @Transactional
    public void delete(UUID id) {
        if (steps.countByIncludedScenarioId(id) > 0){
            throw new ApiException("Bu senaryo başka senaryolar tarafından kalıtım alınıyor, önce o bağları kaldırın", HttpStatus.CONFLICT);
        }
        scenarios.delete(findOwned(id));
    }

    private Page<ScenarioResponse> withIncludedFlag(Page<Scenario> page) {
        Set<UUID> ids = page.getContent().stream().map(Scenario::getId).collect(Collectors.toSet());
        Set<UUID> included = ids.isEmpty() ? Set.of() : steps.findIncludedScenarioIdsIn(ids);
        return page.map(s -> mapper.toResponse(s, included.contains(s.getId())));
    }

    private Scenario findOwned(UUID scenarioId) {
        return scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new RuntimeException("Senaryo bulunamadı"));
    }
}