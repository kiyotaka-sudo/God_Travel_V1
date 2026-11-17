package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "VILLE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ville {

    @Id
    @Column(name = "ID_VILLE", length = 20, nullable = false)
    private String idVille;

    @Column(name = "NOM_VILLE", length = 50, nullable = false, unique = true)
    private String nomVille;

    @Column(name = "REGION", length = 50, nullable = false)
    private String region;
}

