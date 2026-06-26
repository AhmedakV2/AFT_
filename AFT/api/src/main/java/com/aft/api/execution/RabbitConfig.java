package com.aft.api.execution;

import com.aft.common.messaging.RunQueue;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    @Bean
    public Queue runQueue() {
        return QueueBuilder.durable(RunQueue.NAME)
                .withArgument("x-dead-letter-exchange", "aft.scenario.run.dlx")
                .build();
    }
}