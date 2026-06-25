package com.aft.common.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "scheduled_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScheduledTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    @Column(name = "cron_expression",nullable = false,length = 100)
    private String cronExpression;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "next_fire_at")
    private Instant nextFireAt;

    @Column(name = "last_fired_at")
    private Instant lastFiredAt;

}
