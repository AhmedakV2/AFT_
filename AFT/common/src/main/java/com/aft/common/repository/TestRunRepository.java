package com.aft.common.repository;

import com.aft.common.domain.TestRun;
import com.aft.common.enums.RunStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestRunRepository extends JpaRepository<TestRun, UUID> {

    Optional<TestRun> findByIdAndScenario_Module_Project_User_Id(UUID id, UUID userId);

    long countByScenario_Id(UUID scenarioId);

    long countByScenario_IdAndStatus(UUID scenarioId, RunStatus status);

    List<TestRun> findTop10ByScenario_IdOrderByCreatedAtDesc(UUID scenarioId);

    long countByScenario_Module_Project_User_IdAndStatusIn(UUID userId, Collection<RunStatus> statuses);

    List<TestRun> findByStatusAndStartedAtBefore(RunStatus status, Instant before);

    @Query("""
           select count(tr) from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId
           """)
    long countByUser(UUID userId);

    @Query("""
           select count(tr) from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId and tr.status = :status
           """)
    long countByUserAndStatus(UUID userId, RunStatus status);

    @Query("""
           select count(tr) from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId and tr.createdAt >= :from
           """)
    long countByUserSince(UUID userId, Instant from);

    @Query("""
           select count(tr) from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId and tr.createdAt >= :start and tr.createdAt < :end
           """)
    long countByUserBetween(UUID userId, Instant start, Instant end);

    @Query("""
           select tr from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId
           order by tr.createdAt desc
           """)
    List<TestRun> findRecentByUser(UUID userId, Pageable pageable);

    @Query("""
           select tr from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId and tr.status = :status
           order by tr.createdAt desc
           """)
    List<TestRun> findRecentByUserAndStatus(UUID userId, RunStatus status, Pageable pageable);

    @Query("""
           select p.name as name, p.cardColor as color, count(tr) as runCount
           from TestRun tr
             join tr.scenario s join s.module m join m.project p
           where p.user.id = :userId
           group by p.id, p.name, p.cardColor
           order by count(tr) desc
           """)
    List<PopularProjectRow> findPopularProjects(UUID userId, Pageable pageable);

    interface PopularProjectRow {
        String getName();
        String getColor();
        long getRunCount();
    }
}