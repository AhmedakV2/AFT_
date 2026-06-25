package com.aft.common.domain;

import com.aft.common.enums.RunStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "test_runs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestRun extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RunStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "total_steps",nullable = false)
    private int totalSteps;

    @Column(name = "passed_steps",nullable = false)
    private int passedSteps;

}
