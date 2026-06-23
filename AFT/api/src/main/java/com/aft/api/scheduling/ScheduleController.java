package com.aft.api.scheduling;


import com.aft.api.common.ApiResponse;
import com.aft.api.scheduling.dto.CreateScheduleRequest;
import com.aft.api.scheduling.dto.ScheduleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;


    @PostMapping("/scenarios/{scenarioId}/schedules")
    public ApiResponse<ScheduleResponse> create(@PathVariable UUID scenarioId, @Valid @RequestBody CreateScheduleRequest req){
        return ApiResponse.ok(scheduleService.create(scenarioId, req.cron()));
    }

    @GetMapping("/scenarios/{scenarioId}/schedules")
    public ApiResponse<List<ScheduleResponse>>  list(@PathVariable UUID scenarioId){
        return ApiResponse.ok(scheduleService.list(scenarioId));
    }

    @PatchMapping("/schedules/{taskId}")
    public ApiResponse<ScheduleResponse> toggle(@PathVariable UUID taskId , @RequestBody Map<String,Boolean> body){
        return ApiResponse.ok(scheduleService.toggle(taskId, body.getOrDefault("active", true)));
    }

    @DeleteMapping("/schedules/{taskId}")
    public ApiResponse<Void> delete(@PathVariable UUID taskId){
        scheduleService.delete(taskId);
        return ApiResponse.ok(null);
    }
}
