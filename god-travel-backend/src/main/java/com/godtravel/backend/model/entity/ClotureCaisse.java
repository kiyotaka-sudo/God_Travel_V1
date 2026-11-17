package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "CLOTURE_CAISSE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClotureCaisse {

    @Id
    @Column(name = "ID_CLOTURE", length = 20, nullable = false)
    private String idCloture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE", nullable = false)
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE_GUICHETIER", nullable = false)
    private Employe employeGuichetier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE_CHEF")
    private Employe employeChef;

    @Column(name = "DATE_CLOTURE", nullable = false)
    private LocalDate dateCloture;

    @Column(name = "HEURE_OUVERTURE", nullable = false)
    private LocalTime heureOuverture;

    @Column(name = "HEURE_FERMETURE")
    private LocalTime heureFermeture;

    @Column(name = "MONTANT_THEORIQUE_XAF", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal montantTheoriqueXaf = BigDecimal.ZERO;

    @Column(name = "MONTANT_COMPTE_XAF", precision = 12, scale = 2)
    private BigDecimal montantCompteXaf;

    @Column(name = "ECART_CONSTATE_XAF", precision = 12, scale = 2)
    private BigDecimal ecartConstateXaf;

    @Column(name = "OBSERVATION_CLOTURE", length = 255)
    private String observationCloture;
}

