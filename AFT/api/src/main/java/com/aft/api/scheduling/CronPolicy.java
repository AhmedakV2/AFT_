package com.aft.api.scheduling;

import com.aft.api.common.exception.ValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class CronPolicy {

    @Value("${aft.schedule.min-interval-seconds:60}")
    private long minIntervalSeconds;

    private static final int SAMPLE = 6;

    public void validate(String cron) {
        if (cron == null || cron.isBlank())
            throw new ValidationException("Cron ifadesi boş olamaz.");
        if (!CronExpression.isValidExpression(cron))
            throw new ValidationException("Geçersiz cron ifadesi: " + cron);

        CronExpression expr = CronExpression.parse(cron);
        LocalDateTime prev = expr.next(LocalDateTime.now());
        if (prev == null)
            throw new ValidationException("Bu cron hiçbir zaman tetiklenmez: " + cron);

        Duration min = Duration.ofSeconds(minIntervalSeconds);
        for (int i = 0; i < SAMPLE; i++) {
            LocalDateTime next = expr.next(prev);
            if (next == null) break;
            if (Duration.between(prev, next).compareTo(min) < 0)
                throw new ValidationException(
                        "Çok sık tetikleme. Planlar en fazla " + minIntervalSeconds + " saniyede bir çalışabilir.");
            prev = next;
        }
    }
}