package com.aft.common.repository;

import com.aft.common.domain.ScheduledTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduledTaskRepository extends JpaRepository<ScheduledTask, UUID> {

    List<ScheduledTask> findByActiveTrueAndNextFireAtLessThanEqual(Instant now);

    List<ScheduledTask> findByScenario_IdAndScenario_Module_Project_User_Id(UUID scenarioId, UUID userId);

    Optional<ScheduledTask> findByIdAndScenario_Module_Project_User_Id(UUID Id, UUID userId);

    @Query("""
           select count(st) from ScheduledTask st
             join st.scenario s join s.module m join m.project p
           where st.active = true and p.user.id = :userId
           """)
    long countActiveByUser(UUID userId);

    @Query("""
           select st from ScheduledTask st
             join st.scenario s join s.module m join m.project p
           where st.active = true and p.user.id = :userId
           order by st.nextFireAt asc
           """)
    List<ScheduledTask> findUpcomingByUser(UUID userId, Pageable pageable);
}