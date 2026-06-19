package com.aft.common.repository;

import com.aft.common.domain.Scenario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScenarioRepository extends JpaRepository<Scenario, UUID> {

    Page<Scenario> findByModule_Project_User_Id(UUID userId, Pageable pageable);

    Optional<Scenario> findByIdAndModule_Project_User_Id(UUID id, UUID userId);

    Page<Scenario> findByModule_IdAndModule_Project_User_Id(UUID moduleId, UUID userId, Pageable pageable);

    Page<Scenario> findByModule_Project_User_IdAndNameContainingIgnoreCase(UUID userId, String query, Pageable pageable);
}