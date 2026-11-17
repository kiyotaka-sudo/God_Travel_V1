package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "VOYAGE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Voyage {

    @Id
    @Column(name = "ID_VOYAGE", length = 20, nullable = false)
    private String idVoyage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIGNE", nullable = false)
    private Ligne ligne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BUS", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE", nullable = false)
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HORAIRE")
    private HoraireDepart horaireDepart;

    @Column(name = "CODE_VOYAGE", length = 30, nullable = false, unique = true)
    private String codeVoyage;

    @Column(name = "DATE_HEURE_DEPART_PREVUE", nullable = false)
    private LocalDateTime dateHeureDepartPrevue;

    @Column(name = "DATE_HEURE_DEPART_REELLE")
    private LocalDateTime dateHeureDepartReelle;

    @Column(name = "DATE_HEURE_ARRIVEE_PREVUE", nullable = false)
    private LocalDateTime dateHeureArriveePrevue;

    @Column(name = "DATE_HEURE_ARRIVEE_REELLE")
    private LocalDateTime dateHeureArriveeReelle;

    @Column(name = "STATUT_VOYAGE", length = 20, nullable = false)
    @Builder.Default
    private String statutVoyage = "PROGRAMME";
}

