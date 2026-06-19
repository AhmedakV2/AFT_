package com.aft.api.scenario;

import com.aft.api.scenario.dto.ScenarioResponse;
import com.aft.common.domain.Scenario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ScenarioMapper {

    ScenarioResponse toResponse(Scenario scenario);
}
