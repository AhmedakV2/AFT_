package com.aft.common.domain;

import com.aft.common.enums.ScenarioStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scenarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Scenario extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScenarioStatus status;
}
