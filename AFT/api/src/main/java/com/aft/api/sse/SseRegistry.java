package com.aft.api.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseRegistry {

    private final Map<String, List<SseEmitter>> emitters=new ConcurrentHashMap<>();

    public SseEmitter register(String testRunId){
        SseEmitter emitter=new SseEmitter(0L);
        emitters.computeIfAbsent(testRunId,k->new ArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(testRunId,emitter));
        emitter.onTimeout(() -> remove(testRunId,emitter));
        return emitter;
    }

    public void send(String testRunId,String data){
        List<SseEmitter> list=this.emitters.get(testRunId);
        if(list==null) return;
        for(SseEmitter e : List.copyOf(list)){
            try{e.send(SseEmitter.event().data(data));}
            catch(Exception ex){ remove(testRunId,e);}
        }
        if (data.startsWith("DONE:")) {
            if (emitters.containsKey(testRunId)) {
                List.copyOf(emitters.get(testRunId)).forEach(SseEmitter::complete);
            }
        }

    }
    private void remove(String testRunId, SseEmitter e) {
        List<SseEmitter> list = emitters.get(testRunId);
        if (list != null) { list.remove(e); if (list.isEmpty()) emitters.remove(testRunId); }
    }
}
