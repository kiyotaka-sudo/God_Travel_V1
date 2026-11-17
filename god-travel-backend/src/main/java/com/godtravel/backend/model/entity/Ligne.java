package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LIGNE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ligne {

    @Id
    @Column(name = "ID_LIGNE", length = 20, nullable = false)
    private String idLigne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VILLE_DEPART", nullable = false)
    private Ville villeDepart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VILLE_ARRIVEE", nullable = false)
    private Ville villeArrivee;

    @Column(name = "CODE_LIGNE", length = 20, nullable = false, unique = true)
    private String codeLigne;

    @Column(name = "DISTANCE_KM")
    private Integer distanceKm;

    @Column(name = "DUREE_ESTIMEE_MIN")
    private Integer dureeEstimeeMin;
}

