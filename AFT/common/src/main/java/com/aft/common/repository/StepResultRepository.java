package com.aft.common.repository;

import com.aft.common.domain.StepResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StepResultRepository extends JpaRepository<StepResult, UUID> {

    List<StepResult> findByTestRun_IdOrderByExecutedAtAsc(UUID testRunId );
}
