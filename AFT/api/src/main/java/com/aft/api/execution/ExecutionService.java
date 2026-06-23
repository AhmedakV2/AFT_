package com.aft.api.execution;

import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.execution.dto.RunResponse;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.messaging.RunQueue;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import com.aft.common.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ScenarioRepository scenarios;
    private final StepRepository steps;
    private final TestRunRepository testRuns;
    private final RabbitTemplate rabbit;


    @Transactional
    public RunResponse trigger(UUID scenarioId) {
        Scenario scenario = scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(()-> new NotFoundException("Senaryo bulunamadı"));

        int total= steps.countByScenario_Id(scenarioId);
        TestRun run = testRuns.save(TestRun.builder()
                        .scenario(scenario)
                        .status(RunStatus.QUEUED)
                        .totalSteps(total)
                        .passedSteps(0)
                        .build()
                );

        UUID runId = run.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization()  {
            @Override public void afterCommit() {
                rabbit.convertAndSend(RunQueue.NAME, runId.toString());
            }

        });
        return new RunResponse(runId,run.getStatus(),total);

    }

    @Transactional
    public UUID triggerSystem(UUID scenarioId) {
        Scenario scenario = scenarios.findById(scenarioId)
                .orElseThrow(()-> new NotFoundException("Senaryo bulunamadı"));

        int total = steps.countByScenario_Id(scenarioId);
        TestRun run = testRuns.save(TestRun.builder()
                .scenario(scenario)
                .status(RunStatus.QUEUED)
                .totalSteps(total)
                .passedSteps(0)
                .build());

        UUID runId = run.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization()  {
            @Override public void afterCommit(){
                rabbit.convertAndSend(RunQueue.NAME, runId.toString());
            }
        });
        return runId;
    }
}
