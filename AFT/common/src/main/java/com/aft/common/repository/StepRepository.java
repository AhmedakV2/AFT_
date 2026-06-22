package com.aft.common.repository;

import com.aft.common.domain.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StepRepository extends JpaRepository<Step, UUID> {


    List<Step>findByScenario_IdOrderByStepOrderAsc(UUID scenarioId);
    Optional<Step> findByIdAndScenario_Module_Project_User_Id(UUID id, UUID userId);

    @Modifying
    void deleteByScenario_Id(UUID scenarioId);

    int countByScenario_Id(UUID scenarioId);


}
