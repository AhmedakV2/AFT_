package com.aft.api.step;

import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.step.dto.StepResponse;
import com.aft.api.step.dto.UpdateStepRequest;      // eksikti
import com.aft.common.domain.Step;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
}