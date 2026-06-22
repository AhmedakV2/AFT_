package com.aft.api.step;

import com.aft.api.step.dto.StepResponse;
import com.aft.common.domain.Step;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StepMapper {

    StepResponse toResponse(Step step);
}
