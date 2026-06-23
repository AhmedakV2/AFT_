package com.aft.common.repository;

import com.aft.common.domain.StepResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface StepResultRepository extends JpaRepository<StepResult, UUID> {

    List<StepResult> findByTestRun_IdOrderByExecutedAtAsc(UUID testRunId );

    @Query("""
       select sr.step.id as stepId, count(sr) as failCount
       from StepResult sr
       where sr.testRun.scenario.id = :scenarioId and sr.passed = false
       group by sr.step.id
       order by count(sr) desc
       """)
    List<StepFailCount> findMostFailingSteps(UUID scenarioId, Pageable pageable);

    interface StepFailCount {
        UUID getStepId();
        long getFailCount();
    }

}
