package com.aft.common.repository;

import com.aft.common.domain.Scenario;
import com.aft.common.domain.ScheduledTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduledTaskRepository extends JpaRepository<ScheduledTask, UUID> {

    List<ScheduledTask> findByActiveTrueAndNextFireAtLessThanEqual(Instant now);

    List<ScheduledTask> findByScenario_IdAndScenario_Module_Project_User_Id(UUID scenarioId, UUID userId);

    Optional<ScheduledTask> findByIdAndScenario_Module_Project_User_Id(UUID Id,UUID userId);
}
