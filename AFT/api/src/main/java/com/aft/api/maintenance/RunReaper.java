package com.aft.api.maintenance;

import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RunReaper {

    private static final Duration MAX_RUN = Duration.ofMinutes(15);
    private final TestRunRepository testRuns;

    @Scheduled(fixedDelay = 300_000)
    @SchedulerLock(name = "RunReaper_sweep",lockAtMostFor = "PT4M")
    @Transactional
    public void sweep() {
        Instant threshold = Instant.now().minus(MAX_RUN);
        List<TestRun> stuck =testRuns.findByStatusAndStartedAtBefore(RunStatus.RUNNING,threshold);
        for(TestRun run : stuck) {
            run.setStatus(RunStatus.FAILED);
            run.setFinishedAt(Instant.now());
            log.warn("Takılı çalıştırma FAILLED'e çekildi: {} (başlangıç {} )",run.getId(),run.getStartedAt());
        }
        if(!stuck.isEmpty()) log.info("Reaper {} takılı çalıştırma toparlandı",stuck.size());
    }
}
