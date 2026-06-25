package com.aft.worker.engine;

import com.aft.common.domain.Step;
import com.aft.common.scenario.ScenarioFlattener;
import com.aft.worker.storage.ScreenshotUploader;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class ScenarioExecutor {

    private final RunStateService state;
    private final StepInterpreter interpreter;
    private final WebDriverProvider driverProvider;
    private final ScreenshotUploader screenshots;
    private final MeterRegistry metrics;
    private final ScenarioFlattener flattener;


    public void execute(UUID testRunId) {
        UUID scenarioId = state.startRun(testRunId);
        List<Step> stepList = flattener.flatten(scenarioId);
        WebDriver driver = driverProvider.create();

        int passed = 0;
        boolean failed = false;
        try{
            for(Step step : stepList){
                try{
                    interpreter.execute(step,driver);
                    state.recordStep(testRunId,step.getId(),true,null,null);
                    passed++;
                    metrics.counter("aft.steps.executed", "result", "pass").increment();
                }catch(Exception e){
                    String key = screenshots.upload(driver,testRunId,step.getStepOrder());
                    state.recordStep(testRunId,step.getId(),false,e.getMessage(),key);
                    failed = true;
                    metrics.counter("aft.steps.executed", "result", "fail").increment();
                    log.warn("Adım başarısız [run={},order={}]:{}",testRunId,step.getStepOrder(),e.getMessage() );
                    break;
                }
            }
        }finally {
            driver.quit();
        }

        metrics.counter("aft.runs.completed", "result", failed ? "failed" : "passed").increment();
        state.finishRun(testRunId,passed,failed);
    }

}