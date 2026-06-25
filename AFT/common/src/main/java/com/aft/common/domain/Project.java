package com.aft.common.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project extends BaseEntity{

    @ManyToOne(fetch= FetchType.LAZY,optional = false)
    @JoinColumn(name= "user_Id")
    private User user;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name ="base_url",nullable = false )
    private String baseUrl;

    @Column(name = "card_color",nullable = false)
    private String cardColor;

}
