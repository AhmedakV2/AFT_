package com.aft.api.dashboard;

import com.aft.api.common.ApiResponse;
import com.aft.api.dashboard.dto.DashboardDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboard;

    @GetMapping("/dashboard/summary")
    public ApiResponse<Summary> summary() {
        return ApiResponse.ok(dashboard.summary());
    }

    @GetMapping("/runs/recent")
    public ApiResponse<List<RecentRun>> recent(@RequestParam(defaultValue = "8") int limit) {
        return ApiResponse.ok(dashboard.recentRuns(limit));
    }

    @GetMapping("/alerts")
    public ApiResponse<List<Alert>> alerts(@RequestParam(defaultValue = "4") int limit) {
        return ApiResponse.ok(dashboard.alerts(limit));
    }

    @GetMapping("/schedules/upcoming")
    public ApiResponse<List<UpcomingSchedule>> upcoming(@RequestParam(defaultValue = "4") int limit) {
        return ApiResponse.ok(dashboard.upcoming(limit));
    }

    @GetMapping("/projects/popular")
    public ApiResponse<List<PopularProject>> popular(@RequestParam(defaultValue = "3") int limit) {
        return ApiResponse.ok(dashboard.popularProjects(limit));
    }
}