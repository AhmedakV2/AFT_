package com.aft.api.sse;


import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RunEventListener {

    private static final String EXCHANGE = "aft.run.evets";
    private final SseRegistry registry;


    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(autoDelete = "true", exclusive = "true"),
            exchange = @Exchange(value = EXCHANGE, type = ExchangeTypes.TOPIC),
            key = "#"))
    public void onEvent(Message msg){
        String routingKey=
                msg.getMessageProperties().getReceivedRoutingKey();
        String payload = new String(msg.getBody());
        registry.send(routingKey,payload);
    }

}
