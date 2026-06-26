package com.aft.api.scheduling;

import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.exception.ValidationException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.scheduling.dto.ScheduleResponse;
import com.aft.common.domain.Scenario;
import com.aft.common.domain.ScheduledTask;
import com.aft.common.repository.ScenarioRepository;
import com.aft.common.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduledTaskRepository tasks;
    private final ScenarioRepository scenarios;
    private final CronPolicy cronPolicy;

    @Transactional
    public ScheduleResponse create(UUID scenarioId, String cron) {
        Scenario scenario = scenarios.findByIdAndModule_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Senaryo bulunamadı"));

        cronPolicy.validate(cron);
        Instant next = computeNext(cron);
        ScheduledTask task = tasks.save(ScheduledTask.builder()
                .scenario(scenario)
                .cronExpression(cron)
                .active(true)
                .nextFireAt(next)
                .build());
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> list(UUID scenarioId) {
        return tasks.findByScenario_IdAndScenario_Module_Project_User_Id(scenarioId, SecurityUtils.currentUserId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ScheduleResponse toggle(UUID taskId, boolean active) {
        ScheduledTask task = owned(taskId);
        task.setActive(active);
        if (active) {
            cronPolicy.validate(task.getCronExpression());      // tekrar aktifte de policy'yi doğrula
            task.setNextFireAt(computeNext(task.getCronExpression()));
        }
        return toResponse(task);
    }

    @Transactional
    public void delete(UUID taskId) {
        tasks.delete(owned(taskId));
    }

    private ScheduledTask owned(UUID taskId) {
        return tasks.findByIdAndScenario_Module_Project_User_Id(taskId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Zamanlanmış plan bulunamadı"));
    }

    private Instant computeNext(String cron) {
        if (!CronExpression.isValidExpression(cron)) {
            throw new ValidationException("Geçersiz cron ifadesi: " + cron);
        }
        LocalDateTime next = CronExpression.parse(cron).next(LocalDateTime.now());
        if (next == null) throw new ValidationException("Bu cron hiçbir zaman tetiklenmez: " + cron);
        return next.atZone(ZoneId.systemDefault()).toInstant();
    }

    private ScheduleResponse toResponse(ScheduledTask t) {
        return new ScheduleResponse(t.getId(), t.getCronExpression(), t.isActive(),
                t.getNextFireAt(), t.getLastFiredAt());
    }
}