package com.aft.api.scenario;

import com.aft.api.scenario.dto.ScenarioResponse;
import com.aft.common.domain.Scenario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScenarioMapper {

    @Mapping(target = "included", ignore = true)
    ScenarioResponse toResponse(Scenario scenario);

    default ScenarioResponse toResponse(Scenario s, boolean included) {
        ScenarioResponse r = toResponse(s);
        return new ScenarioResponse(r.id(), r.name(), r.description(), r.status(), included,r.createdAt());
    }
}