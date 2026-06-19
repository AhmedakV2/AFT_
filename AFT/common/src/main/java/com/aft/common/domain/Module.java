package com.aft.common.domain;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Module extends BaseEntity{

    @ManyToOne(fetch= FetchType.LAZY,optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private String name;

    private String description;
}
