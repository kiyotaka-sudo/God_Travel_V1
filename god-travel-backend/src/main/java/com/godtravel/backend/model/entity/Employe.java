package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "EMPLOYE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employe {

    @Id
    @Column(name = "ID_EMPLOYE", length = 20, nullable = false)
    private String idEmploye;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPAGNIE", nullable = false)
    private Compagnie compagnie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE", nullable = false)
    private Agence agence;

    @Column(name = "MATRICULE", length = 20, nullable = false, unique = true)
    private String matricule;

    @Column(name = "NOM", length = 50, nullable = false)
    private String nom;

    @Column(name = "PRENOM", length = 50)
    private String prenom;

    @Column(name = "NUMERO_CNI", length = 30, nullable = false, unique = true)
    private String numeroCni;

    @Column(name = "TELEPHONE", length = 20, nullable = false)
    private String telephone;

    @Column(name = "FONCTION", length = 50, nullable = false)
    private String fonction;

    @Column(name = "DATE_EMBAUCHE", nullable = false)
    private LocalDate dateEmbauche;

    @Column(name = "STATUT_EMPLOYE", length = 20, nullable = false)
    @Builder.Default
    private String statutEmploye = "ACTIF";
}

