package com.aft.common.repository;

import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestRunRepository extends JpaRepository<TestRun, UUID> {
    Optional<TestRun> findByIdAndScenario_Module_Project_User_Id(UUID id,UUID userId);
    long countByScenario_Id(UUID scenarioId);
    long countByScenario_IdAndStatus(UUID scenarioId, RunStatus status);
    List<TestRun> findTop10ByScenario_IdOrderByCreatedAtDesc(UUID scenarioId);

}
