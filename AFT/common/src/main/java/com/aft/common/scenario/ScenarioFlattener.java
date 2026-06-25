package com.aft.common.scenario;

import com.aft.common.domain.Step;
import com.aft.common.enums.ActionType;
import com.aft.common.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScenarioFlattener {

    private static final int MAX_DEPTH = 20;
    private final StepRepository steps;
    public List<Step> flatten(UUID scenarioId) {
        List<Step> out = new ArrayList<>();
        expand(scenarioId, out, new LinkedHashSet<>(), 0);
        return out;
    }


    public int countFlattened(UUID scenarioId) {
        return flatten(scenarioId).size();
    }
    private void expand(UUID scenarioId, List<Step> out, Set<UUID> path, int depth) {
        if (depth > MAX_DEPTH) throw new IllegalStateException("Kalıtım derinliği aşıldı: " + scenarioId);
        if (!path.add(scenarioId)) throw new IllegalStateException("Kalıtım döngüsü tespit edildi: " + scenarioId);

        for (Step step : steps.findByScenario_IdOrderByStepOrderAsc(scenarioId)) {
            if (step.getAction() == ActionType.INCLUDE_SCENARIO) {
                UUID target = step.getIncludedScenarioId();
                if (target != null) expand(target, out, path, depth + 1);
            } else {
                out.add(step);
            }
        }
        path.remove(scenarioId);
    }
}