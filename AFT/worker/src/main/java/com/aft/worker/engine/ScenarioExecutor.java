package com.aft.worker.engine;

import com.aft.common.domain.Step;
import com.aft.common.repository.StepRepository;
import com.aft.worker.storage.ScreenshotUploader;
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
    private final StepRepository steps;
    private final StepInterpreter interpreter;
    private final WebDriverProvider driverProvider;
    private final ScreenshotUploader screenshots;


    public void execute(UUID testRunId) {
        UUID scenarioId = state.startRun(testRunId);
        List<Step> stepList = steps.findByScenario_IdOrderByStepOrderAsc(scenarioId);
        WebDriver driver = driverProvider.create();

        int passed = 0;
        boolean failed = false;
        try{
            for(Step step : stepList){
                try{
                    interpreter.execute(step,driver);
                    state.recordStep(testRunId,step.getId(),true,null,null);
                    passed++;
                }catch(Exception e){
                    String key =screenshots.upload(driver,testRunId,step.getStepOrder());
                    state.recordStep(testRunId,step.getId(),false,e.getMessage(),key);
                    failed = true;
                    log.warn("Adım başarısız [run={},order={}]:{}",testRunId,step.getStepOrder(),e.getMessage() );
                  break;
                }
            }
        }finally {
            driver.quit();
        }
        state.finishRun(testRunId,passed,failed);
    }
}
