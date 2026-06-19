package com.aft.common.repository;

import com.aft.common.domain.Module;
import com.aft.common.domain.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {

    Page<Module> findByUserId(UUID userId, Pageable pageable);

    Optional<Module> findByIdAndUserId(UUID id, UUID userId);

    Optional<Module> findByIdAndProject_User_Id(UUID id, UUID userId);

    Page<Module> findByProject_IdAndProject_User_Id(UUID projectId, UUID userId, Pageable pageable);

    Page<Module> findByProject_User_IdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);
}