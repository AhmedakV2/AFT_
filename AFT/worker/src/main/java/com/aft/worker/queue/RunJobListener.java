package com.aft.worker.queue;

import com.aft.common.messaging.RunQueue;
import com.aft.worker.engine.ScenarioExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import  org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RunJobListener {

    private final ScenarioExecutor executor;

    @RabbitListener(queues = RunQueue.NAME,concurrency = "2")
    public void onMessage(String testRunId) {
        log.info("Calıştırma sıraya alında: {}", testRunId);
        try{
            executor.execute(UUID.fromString(testRunId));
        }catch (Exception e){
            log.error("Calıştırma başarısız: {}", testRunId, e);
        }
    }
}
