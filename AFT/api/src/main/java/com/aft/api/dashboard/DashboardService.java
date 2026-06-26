package com.aft.api.dashboard;

import com.aft.api.common.security.SecurityUtils;
import com.aft.api.dashboard.dto.DashboardDtos.*;
import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import com.aft.common.repository.ScheduledTaskRepository;
import com.aft.common.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TestRunRepository testRuns;
    private final ScheduledTaskRepository schedules;


    @Transactional(readOnly = true)
    public Summary summary() {
        UUID userId = SecurityUtils.currentUserId();

        long total  = testRuns.countByUser(userId);
        long passed = testRuns.countByUserAndStatus(userId, RunStatus.PASSED);
        Double rate = total == 0 ? null : Math.round(passed*1000.0/total) /10.0;
        long activeSchedules = schedules.countActiveByUser(userId);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        Instant monthStart = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant prevStart = today.withDayOfMonth(1).minusMonths(1).atStartOfDay(zone).toInstant();

        long monthly = testRuns.countByUserSince(userId,monthStart);
        long prevMonthly = testRuns.countByUserBetween(userId, prevStart, monthStart);
        Long monthlyDelta = prevMonthly == 0 ? null : Math.round((monthly - prevMonthly) * 100.0 / prevMonthly);

        return new Summary(total,null,activeSchedules,rate,monthly,prevMonthly,monthlyDelta);
    }

    @Transactional(readOnly = true)
    public List<RecentRun> recentRuns(int limit) {
        UUID userId = SecurityUtils.currentUserId();
        return testRuns.findRecentByUser(userId, PageRequest.of(0, limit)).stream()
                .map(this::toRecent).toList();
    }

    @Transactional(readOnly = true)
    public List<Alert> alerts(int limit) {
        UUID userId = SecurityUtils.currentUserId();
        return testRuns.findRecentByUserAndStatus(userId, RunStatus.FAILED, PageRequest.of(0, limit)).stream()
                .map(r -> {
                    var s = r.getScenario();
                    String proj = s.getModule().getProject().getName();
                    int total = r.getTotalSteps(), passed = r.getPassedSteps();
                    return new Alert(
                            s.getName() + " başarısız",
                            proj + " · " + passed + "/" + total + " adım geçti",
                            "HIGH");
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<UpcomingSchedule> upcoming(int limit) {
        UUID userId = SecurityUtils.currentUserId();
        return schedules.findUpcomingByUser(userId, PageRequest.of(0, limit)).stream()
                .map(t -> {
                    var s = t.getScenario();
                    return new UpcomingSchedule(s.getName(), s.getModule().getProject().getName(), 1, t.getNextFireAt());
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<PopularProject> popularProjects(int limit) {
        UUID userId = SecurityUtils.currentUserId();
        return testRuns.findPopularProjects(userId, PageRequest.of(0, limit)).stream()
                .map(p -> new PopularProject(p.getName(), p.getColor(), p.getRunCount())).toList();
    }

    private RecentRun toRecent(TestRun r) {
        var s = r.getScenario();
        Instant runAt = r.getStartedAt() != null ? r.getStartedAt() : r.getCreatedAt();
        return new RecentRun(
                s.getModule().getProject().getName(),
                s.getName(),
                r.getStatus().name(),
                r.getTotalSteps(),
                r.getPassedSteps(),
                runAt);
    }
}
