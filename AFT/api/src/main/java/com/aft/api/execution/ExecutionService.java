package com.aft.api.execution;

import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.exception.TooManyRequestsException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.execution.dto.RunResponse;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.messaging.RunQueue;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.TestRunRepository;
import com.aft.common.scenario.ScenarioFlattener;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ScenarioRepository scenarios;
    private final TestRunRepository testRuns;
    private final RabbitTemplate rabbit;
    private final ScenarioFlattener flattener;

    @Value("${aft.limits.max-concurrent-runs-per-user:5}")
    private int maxConcurrentPerUser;

    @Transactional
    public RunResponse trigger(UUID scenarioId) {
        UUID userId = SecurityUtils.currentUserId();
        long active = testRuns.countByScenario_Module_Project_User_IdAndStatusIn(
                userId, List.of(RunStatus.QUEUED, RunStatus.RUNNING));
        if (active >= maxConcurrentPerUser) {
            throw new TooManyRequestsException(
                    "Ayni anda en fazla " + maxConcurrentPerUser + " calistirma yapabilirsiniz. "
                            + "Mevcut calistirmalar bitince tekrar deneyin.");
        }

        Scenario scenario = scenarios.findByIdAndModule_Project_User_Id(scenarioId, userId)
                .orElseThrow(() -> new NotFoundException("Senaryo bulunamadı"));

        int total = flattener.countFlattened(scenarioId);
        TestRun run = testRuns.save(TestRun.builder()
                .scenario(scenario)
                .status(RunStatus.QUEUED)
                .totalSteps(total)
                .passedSteps(0)
                .build());

        UUID runId = run.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                rabbit.convertAndSend(RunQueue.NAME, runId.toString());
            }
        });
        return new RunResponse(runId, run.getStatus(), total);
    }

    @Transactional
    public UUID triggerSystem(UUID scenarioId) {
        Scenario scenario = scenarios.findById(scenarioId)
                .orElseThrow(() -> new NotFoundException("Senaryo bulunamadı"));

        int total = flattener.countFlattened(scenarioId);
        TestRun run = testRuns.save(TestRun.builder()
                .scenario(scenario)
                .status(RunStatus.QUEUED)
                .totalSteps(total)
                .passedSteps(0)
                .build());

        UUID runId = run.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                rabbit.convertAndSend(RunQueue.NAME, runId.toString());
            }
        });
        return runId;
    }
}