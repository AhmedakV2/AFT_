package com.aft.api.execution;

import com.aft.common.messaging.RunQueue;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;




@Configuration
public class RabbitConfig {
    @Bean
    public Queue runQueue() {
        return new Queue(RunQueue.NAME, true);
    }
}
