package com.aft.api.report;

import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.report.dto.RunSummary;
import com.aft.api.report.dto.ScenarioExcelRow;
import com.aft.api.report.dto.ScenarioReport;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.Step;
import com.aft.common.domain.StepResult;
import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.StepRepository;
import com.aft.common.repository.StepResultRepository;
import com.aft.common.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ScenarioRepository scenarios;
    private final TestRunRepository testRuns;
    private final StepResultRepository stepResults;
    private final StepRepository steps;


    @Transactional(readOnly = true)
    public ScenarioReport scenarioReport(UUID scenarioId) {
        scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(()-> new NotFoundException("Senaryo bulunamadı"));

        long total = testRuns.countByScenario_Id(scenarioId);
        long passed=testRuns.countByScenario_IdAndStatus(scenarioId, RunStatus.PASSED);
        double rate = total == 0 ? 0.0: (passed * 100.0 / total );


        ScenarioReport.MostFailingStep worst = stepResults
                .findMostFailingSteps(scenarioId, PageRequest.of(0,1))
                .stream().findFirst()
                .map(p -> {
                    Step s =steps.findById(p.getStepId()).orElse(null);
                    int order = s !=null ? s.getStepOrder() : -1;
                    return new
                            ScenarioReport.MostFailingStep(p.getStepId(), order, p.getFailCount());
                }).orElse(null);
        List<RunSummary> recent = testRuns.findTop10ByScenario_IdOrderByCreatedAtDesc(scenarioId)
                .stream()
                .map(this::toSummary).toList();
        return new ScenarioReport(scenarioId, total, passed, rate, worst, recent);
    }

    @Transactional(readOnly = true)
    public RunSummary runDetail(UUID testRunId) {
        TestRun run = testRuns.findByIdAndScenario_Module_Project_User_Id(testRunId,SecurityUtils.currentUserId())
                .orElseThrow(()-> new NotFoundException("Çalıştırma bulunamadı"));
        return toSummary(run);
    }


    @Transactional(readOnly = true)
    public List<ScenarioExcelRow> excelRowsByScenarioIds(List<UUID> scenarioIds) {
        UUID userId = SecurityUtils.currentUserId();
        List<ScenarioExcelRow> rows = new ArrayList<>();
        int no = 1;
        for(UUID sid : scenarioIds){
            Scenario s = scenarios.findByIdAndModule_Project_User_Id(sid,userId)
                    .orElseThrow(()-> new NotFoundException("Senaryo bulunamadı"));
            rows.add(buildRow(no++,s));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<ScenarioExcelRow> excelRowsByModuleIds(List<UUID> moduleIds) {
        UUID userId = SecurityUtils.currentUserId();
        List<ScenarioExcelRow> rows = new ArrayList<>();

        int no = 1;
        for(UUID mid : moduleIds){
            for(Scenario s : scenarios.findByModule_IdAndModule_Project_User_Id(mid,userId)){
                rows.add(buildRow(no++,s));
            }
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<ScenarioExcelRow> excelRowsByProject(UUID projectId) {
        UUID userId = SecurityUtils.currentUserId();
        List<ScenarioExcelRow> rows = new ArrayList<>();
        int no = 1;
        for (Scenario s : scenarios.findByModule_Project_IdAndModule_Project_User_Id(projectId, userId)) {
            rows.add(buildRow(no++, s));
        }
        return rows;
    }

    private ScenarioExcelRow buildRow(int no, Scenario s) {
        List<TestRun> runs = new ArrayList<>(testRuns.findTop10ByScenario_IdOrderByCreatedAtDesc(s.getId()));
        Collections.reverse(runs);
        List<Boolean> results = runs.stream().map(r -> r.getStatus() == RunStatus.PASSED).toList();


        String failingStep = null, error = null;
        for (int i = runs.size() - 1; i >= 0 && failingStep == null; i--) {
            if (runs.get(i).getStatus() != RunStatus.FAILED) continue;
            for (StepResult sr : stepResults.findByTestRun_IdOrderByExecutedAtAsc(runs.get(i).getId())) {
                if (!sr.isPassed()) {
                    Step st = sr.getStep();
                    failingStep = "#" + st.getStepOrder() + " (" + st.getAction() + ")";
                    error = sr.getErrorMessage();
                    break;
                }
            }
        }
        return new ScenarioExcelRow(no, s.getName(), s.getDescription(), results, failingStep, error);
    }



    private RunSummary toSummary(TestRun r) {
        return new RunSummary(r.getId(),r.getStatus(),r.getTotalSteps(),r.getPassedSteps(),r.getStartedAt(),r.getFinishedAt());
    }

}
