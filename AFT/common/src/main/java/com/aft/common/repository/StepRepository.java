package com.aft.common.repository;

import com.aft.common.domain.Step;
import com.aft.common.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StepRepository extends JpaRepository<Step, UUID> {


    @Query("select coalesce(max(s.stepOrder), 0) from Step s where s.scenario.id = :scenarioId")
    int findMaxOrder(@Param("scenarioId") UUID scenarioId);

    List<Step>findByScenario_IdOrderByStepOrderAsc(UUID scenarioId);
    Optional<Step> findByIdAndScenario_Module_Project_User_Id(UUID id, UUID userId);

    int countByIncludedScenarioId(UUID includedScenarioId);
    List<Step> findByScenario_IdAndAction(UUID scenarioId, ActionType action);

    @Modifying
    void deleteByScenario_Id(UUID scenarioId);

    int countByScenario_Id(UUID scenarioId);


}
