package com.aft.worker.engine;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RunEventPublisher {

    public static final String EXCHANGE = "aft.run.events";
    private final RabbitTemplate rabbit;

    public void publish(UUID testRunId,String payload){
        rabbit.convertAndSend(EXCHANGE,testRunId.toString(),payload);
    }
}
