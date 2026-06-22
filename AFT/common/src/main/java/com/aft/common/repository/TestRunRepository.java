package com.aft.common.repository;

import com.aft.common.domain.TestRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TestRunRepository extends JpaRepository<TestRun, UUID> {
    Optional<TestRun> findByIdAndScenario_Module_Project_User_Id(UUID id,UUID userId);
}
