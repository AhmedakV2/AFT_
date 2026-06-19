package com.aft.api.module;

import com.aft.api.module.dto.ModuleResponse;
import com.aft.common.domain.Module;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModuleMapper {
    ModuleResponse toResponse(Module module);
}
