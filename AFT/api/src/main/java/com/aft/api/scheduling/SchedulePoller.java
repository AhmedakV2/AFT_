package com.aft.api.scheduling;

import com.aft.api.execution.ExecutionService;
import com.aft.common.domain.ScheduledTask;
import com.aft.common.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchedulePoller {

    private final ScheduledTaskRepository tasks;
    private final ExecutionService executionService;


    @Scheduled(fixedDelay = 60_000)
    @SchedulerLock(name = "SchedulePoller_run", lockAtLeastFor = "PT30S", lockAtMostFor = "PT5M")
    @Transactional
    public void poll() {
        Instant now = Instant.now();
        List<ScheduledTask> due =tasks.findByActiveTrueAndNextFireAtLessThanEqual(now);
        for(ScheduledTask task : due) {
            try {
                executionService.triggerSystem(task.getScenario().getId());
                task.setLastFiredAt(now);
                task.setNextFireAt(nextFire(task.getCronExpression(), now));
            }catch (Exception e){
                log.error("Zamanlanmış görev başarısız [task={}]: {}",task.getId(),e.getMessage());

            }
        }
    }

    private Instant nextFire(String cron,Instant from){
        LocalDateTime next = CronExpression.parse(cron)
                .next(LocalDateTime.ofInstant(from, ZoneId.systemDefault()));
        if(next==null) return Instant.MAX;
        return next.atZone(ZoneId.systemDefault()).toInstant();

    }

}
