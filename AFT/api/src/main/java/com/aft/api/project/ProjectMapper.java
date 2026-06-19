package com.aft.api.project;

import com.aft.api.project.dto.ProjectResponse;
import com.aft.common.domain.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectResponse toResponse(Project project);
}
