package com.aft.worker.config;

import com.aft.common.messaging.RunQueue;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String DLX = "aft.scenario.run.dlx";
    public static final String DLQ = "aft.scenario.run.dlq";

    @Bean
    public Queue runQueue() {
        return QueueBuilder.durable(RunQueue.NAME)
                .withArgument("x-dead-letter-exchange", DLX)
                .build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(RunQueue.NAME);
    }

}