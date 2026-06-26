package com.aft.api.dashboard.dto;

import com.aft.common.enums.RunStatus;

import java.time.Instant;

public final class DashboardDtos {

    private DashboardDtos() {}

    public record Summary(
            long totalRuns,
            Long totalDates,
            long activeSchedules,
            Double successRate,
            long monthlyRuns,
            long prevMontRuns,
            long monthlyDelta
    ){}

    public record RecentRun(
            String project,
            String scenario,
            String status,
            int totalSteps,
            int passedSteps,
            Instant runAt
    ){}

    public record Alert(String title ,String message, String severity){}

    public record UpcomingSchedule(String name,String project,int scenarioCount,Instant nextRunAt){}

    public record PopularProject(String name,String color ,long runCount){}

    public static String label(RunStatus s) {return s == null ? "-" : s.name();}

}
