package com.aft.common.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "step_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StepResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "test_run_id")
    private TestRun testRun;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "step_id")
    private Step step;

    @Column(nullable = false)
    private boolean passed;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "screenshot_key",length = 500)
    private String screenshotKey;

    @Column(name = "executed_at",nullable = false)
    private Instant executedAt;
}
