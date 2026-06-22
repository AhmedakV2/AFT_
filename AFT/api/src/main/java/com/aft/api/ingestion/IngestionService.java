package com.aft.api.ingestion;


import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.ingestion.dto.IngestResultResponse;
import com.aft.api.ingestion.dto.IngestStepItem;
import com.aft.api.ingestion.dto.IngestStepsRequest;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.Step;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngestionService {

    private static final int ORDER_GAP= 10;
    private final ScenarioRepository scenarios;
    private final StepRepository steps;


    @Transactional
    public IngestResultResponse ingest(UUID scenarioId, IngestStepsRequest req){
        Scenario scenario =scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(()-new NotFoundException("Senaryo bulunamadı"));

        boolean replace= Boolean.TRUE.equals(req.replace());
        int startOrder;
        if(replace){
            steps.deleteByScenario_Id(scenarioId);
            steps.flush();
            startOrder = ORDER_GAP;
        }
        else {
            startOrder = (steps.countByScenario_Id(scenarioId) + 1) * ORDER_GAP;
        }

        List<Step> toSave = new ArrayList<>();
        int order = startOrder;
        for(IngestStepItem item : req.steps()){
            Step step = Step.builder()
                    .scenario(scenario)
                    .stepOrder(order)
                    .action(item.action())
                    .selectors(item.selectors())
                    .value(item.value())
                    .build();
            toSave.add(step);
            order += ORDER_GAP;

        }
        steps.saveAll(toSave);
        return new IngestResultResponse(scenarioId, toSave.size(), replace);
    }

}
