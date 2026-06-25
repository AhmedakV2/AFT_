package com.aft.worker.engine;

import com.aft.common.domain.StepResult;
import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.repository.StepRepository;
import com.aft.common.repository.StepResultRepository;
import com.aft.common.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RunStateService {

    private final TestRunRepository testRuns;
    private final StepResultRepository stepResults;
    private final StepRepository steps;

    @Transactional
    public UUID startRun(UUID testRunId){
        TestRun run = testRuns.findById(testRunId)
                .orElseThrow(()-> new IllegalStateException("TestRun yok "+testRunId));
        run.setStatus(RunStatus.RUNNING);
        run.setStartedAt(Instant.now());
        return run.getScenario().getId();
    }

    @Transactional
    public void recordStep(UUID testRunId,UUID stepId,boolean passe, String error ,String screenshotKey) {
        stepResults.save(StepResult.builder()
                .testRun(testRuns.getReferenceById(testRunId))
                .step(steps.getReferenceById(stepId))
                .passed(passe)
                .errorMessage(error)
                .screenshotKey(screenshotKey)
                .executedAt(Instant.now())
                .build());
    }

    @Transactional
    public void finishRun(UUID testRunId,int passedSteps,boolean failed){
        TestRun run = testRuns.getReferenceById(testRunId);
        run.setPassedSteps(passedSteps);
        run.setStatus(failed ? RunStatus.FAILED : RunStatus.PASSED);
        run.setFinishedAt(Instant.now());
    }

}
