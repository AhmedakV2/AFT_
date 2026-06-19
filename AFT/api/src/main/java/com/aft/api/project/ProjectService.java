package com.aft.api.project;


import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.project.dto.CreateProjectRequest;
import com.aft.api.project.dto.ProjectResponse;
import com.aft.api.project.dto.UpdateProjectRequest;
import com.aft.common.domain.Project;
import com.aft.common.domain.User;
import com.aft.common.repository.ProjectRepository;
import com.aft.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projects;
    private final UserRepository users;
    private final ProjectMapper mapper;

    public Page<ProjectResponse> list(Pageable pageable){
        UUID userId = SecurityUtils.currentUserId();
        return projects.findByUserId(userId,pageable).map(mapper::toResponse);
    }

    public ProjectResponse get(UUID id) {
        return mapper.toResponse(findOwned(id));
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest req){
        User user=users.getReferenceById(SecurityUtils.currentUserId());
        Project saved = projects.save(Project.builder()
                .user(user)
                .name(req.name())
                .description(req.description())
                .baseUrl(req.baseUrl())
                .cardColor(req.cardColor())
                .build());
        return mapper.toResponse(saved);

    }

    @Transactional
    public ProjectResponse update(UUID id, UpdateProjectRequest req){
        Project p = findOwned(id);
        p.setName(req.name());
        p.setDescription(req.description());
        p.setBaseUrl(req.baseUrl());
        p.setCardColor(req.cardColor());
        return mapper.toResponse(p);
    }


    @Transactional
    public void delete(UUID id){
        projects.delete(findOwned(id));
    }


    private Project findOwned(UUID id) {
        return projects.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new NotFoundException("Proje bulunamadı"));
    }
}
