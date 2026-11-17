package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TARIF")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tarif {

    @Id
    @Column(name = "ID_TARIF", length = 20, nullable = false)
    private String idTarif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIGNE", nullable = false)
    private Ligne ligne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLASSE", nullable = false)
    private ClasseBus classeBus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CATEGORIE", nullable = false)
    private CategorieVoyageur categorieVoyageur;

    @Column(name = "PRIX_XAF", precision = 12, scale = 2, nullable = false)
    private BigDecimal prixXaf;

    @Column(name = "DATE_DEBUT_VALIDITE", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "DATE_FIN_VALIDITE")
    private LocalDate dateFinValidite;
}

