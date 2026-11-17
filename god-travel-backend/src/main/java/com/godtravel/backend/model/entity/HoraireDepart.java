package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "HORAIRE_DEPART")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoraireDepart {

    @Id
    @Column(name = "ID_HORAIRE", length = 20, nullable = false)
    private String idHoraire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIGNE", nullable = false)
    private Ligne ligne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE", nullable = false)
    private Agence agence;

    @Column(name = "HEURE_DEPART", nullable = false)
    private LocalTime heureDepart;

    @Column(name = "JOURS_APPLICABLES", length = 50, nullable = false)
    @Builder.Default
    private String joursApplicables = "TOUS";

    @Column(name = "EST_ACTIF", nullable = false)
    @Builder.Default
    private Boolean estActif = true;
}

