package com.aft.api.report.dto;

import java.util.List;

public record ScenarioExcelRow(
        int no,
        String scenarioName,
        String description,
        List<Boolean> runResults,
        String failingStep,
        String errorMessage
) {}
