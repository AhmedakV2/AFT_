package com.aft.api.step;

import com.aft.api.common.exception.ApiException;
import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.step.dto.CreateStepRequest;
import com.aft.api.step.dto.StepResponse;
import com.aft.api.step.dto.UpdateStepRequest;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.Step;
import com.aft.common.enums.ActionType;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StepService {

    private final StepRepository steps;
    private final ScenarioRepository scenarios;
    private final StepMapper mapper;

    public List<StepResponse> listByScenario(UUID scenarioId) {
        scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Senaryo bulunamadı"));
        return steps.findByScenario_IdOrderByStepOrderAsc(scenarioId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public StepResponse update(UUID stepId, UpdateStepRequest req) {
        Step step = findOwned(stepId);
        if (req.action() != null)    step.setAction(req.action());
        if (req.selectors() != null) step.setSelectors(req.selectors());
        if (req.value() != null)     step.setValue(req.value());
        return mapper.toResponse(step);
    }

    @Transactional
    public void delete(UUID stepId) {
        steps.delete(findOwned(stepId));
    }

    private Step findOwned(UUID stepId) {
        return steps.findByIdAndScenario_Module_Project_User_Id(stepId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Adim bulunamadi"));
    }

    @Transactional
    public StepResponse addInclude(UUID scenarioId,UUID includeScenarioId) {
        UUID userId = SecurityUtils.currentUserId();
        Scenario host = scenarios.findByIdAndModule_Project_User_Id(scenarioId, userId)
                .orElseThrow(() -> new NotFoundException("Senaryo bulunamadı"));

        Scenario target = scenarios.findByIdAndModule_Project_User_Id(includeScenarioId, userId)
                .orElseThrow(() -> new NotFoundException("Kalıtım alınacak senaryo bulunamadı"));

        if (host.getId().equals(target.getId())) {
            throw new ApiException("Senaryo kendini kalıtım alamaz", HttpStatus.BAD_REQUEST);
        }
        if (!host.getModule().getProject().getId().equals(target.getModule().getProject().getId())) {
            throw new ApiException("Sadece aynı projedeki senaryolar kalıtım alınabilir", HttpStatus.BAD_REQUEST);
        }
        if (createsCycle(target.getId(),host.getId())){
            throw new ApiException("Bu kalıtım bir döngü oluşturur", HttpStatus.BAD_REQUEST);
        }

        int order =steps.countByScenario_Id(scenarioId) + 1;
        Step saved = steps.save(Step.builder()
                .scenario(host)
                .action(ActionType.INCLUDE_SCENARIO)
                .includedScenarioId(target.getId())
                .stepOrder(order)
                .build());
        return mapper.toResponse(saved);

    }

    @Transactional
    public List<StepResponse> reorder(UUID scenarioId, List<UUID> orderedIds) {

        UUID userId = SecurityUtils.currentUserId();
        scenarios.findByIdAndModule_Project_User_Id(scenarioId, userId)
                .orElseThrow(()-> new NotFoundException("Senaryo bulunamadi"));

        List<Step> existing = steps.findByScenario_IdOrderByStepOrderAsc(scenarioId);
        if (orderedIds.size() !=existing.size()){
            throw new ApiException("Sıralama listesi adım sayısıyla uyuşmuyor", HttpStatus.BAD_REQUEST);
        }

        Map<UUID, Step> byId= existing.stream().collect(Collectors.toMap(Step::getId, s->s));

        int tmp = -1;
        for (Step s:existing) s.setStepOrder(tmp--);
        steps.flush();

        int order = 1;
        for(UUID id:orderedIds){
            Step s = byId.get(id);
            if(s == null) throw new ApiException("Bilinmeyen adım:" + id, HttpStatus.BAD_REQUEST);
            s.setStepOrder(order++);
        }
        steps.flush();

        return steps.findByScenario_IdOrderByStepOrderAsc(scenarioId).stream().map(this::enrich).toList();
    }

    @Transactional
    public StepResponse create(UUID scenarioId, CreateStepRequest req) {
        UUID userId = SecurityUtils.currentUserId();
        Scenario scenario=scenarios.findByIdAndModule_Project_User_Id(scenarioId, userId)
                .orElseThrow(()-> new NotFoundException("Senaryo bulunamadi"));
        if(req.action() == ActionType.INCLUDE_SCENARIO){
            throw new ApiException("Kalıtım adımı buradan eklenemez",HttpStatus.BAD_REQUEST);
        }

        int order = steps.findMaxOrder(scenarioId) + 1;
        Step saved = steps.save(Step.builder()
                .scenario(scenario)
                .action(req.action())
                .selectors(req.selectors())
                .value(req.value())
                .stepOrder(order)
                .build());
        return mapper.toResponse(saved);
    }

    private StepResponse enrich(Step s) {
        if(s.getAction().equals(ActionType.INCLUDE_SCENARIO) && s.getIncludedScenarioId()!= null) {
            String name = scenarios.findById(s.getIncludedScenarioId()).map(Scenario::getName).orElse("silinmiş");
            return mapper.toResponseWithInclude(s, name);
        }
        return  mapper.toResponse(s);
    }

    private boolean createsCycle(UUID from,UUID to) {
        if(from.equals(to)) return true;
        for (Step inc : steps.findByScenario_IdAndAction(from,ActionType.INCLUDE_SCENARIO)) {
            if (createsCycle(inc.getIncludedScenarioId(),to)) return true;
        }
        return false;
    }
}