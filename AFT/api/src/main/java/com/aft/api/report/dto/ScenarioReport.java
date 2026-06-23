package com.aft.api.report.dto;

import java.util.List;
import java.util.UUID;

public record ScenarioReport(
   UUID scenarioId,
   long totalRuns,
   long passedRuns,
   double successRate,
   MostFailingStep mostFailingStep,
   List<RunSummary> recentRuns

) {
    public record MostFailingStep(UUID stepId,int stepOrder,long failCount) {}
}
