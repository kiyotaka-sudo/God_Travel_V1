package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BUS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @Column(name = "ID_BUS", length = 20, nullable = false)
    private String idBus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPAGNIE", nullable = false)
    private Compagnie compagnie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLASSE", nullable = false)
    private ClasseBus classeBus;

    @Column(name = "IMMATRICULATION", length = 20, nullable = false, unique = true)
    private String immatriculation;

    @Column(name = "MARQUE", length = 50, nullable = false)
    private String marque;

    @Column(name = "MODELE", length = 50)
    private String modele;

    @Column(name = "NB_PLACES", nullable = false)
    private Integer nbPlaces;

    @Column(name = "ANNEE_MISE_SERVICE")
    private Integer anneeMiseService;

    @Column(name = "KILOMETRAGE_TOTAL", nullable = false)
    @Builder.Default
    private Integer kilometrageTotal = 0;

    @Column(name = "STATUT_BUS", length = 20, nullable = false)
    @Builder.Default
    private String statutBus = "DISPONIBLE";
}

