package com.aft.api.report;

import com.aft.api.common.ApiResponse;
import com.aft.api.report.dto.RunSummary;
import com.aft.api.report.dto.ScenarioReport;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/scenarios/{scenarioId}/report")
    public ApiResponse<ScenarioReport> report(@PathVariable UUID scenarioId) {
    return ApiResponse.ok(reportService.scenarioReport(scenarioId));
    }

    @GetMapping("/runs/{testRunId}")
    public ApiResponse<RunSummary> run(@PathVariable UUID testRunId) {
        return ApiResponse.ok(reportService.runDetail(testRunId));
    }
}
