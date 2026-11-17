package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "CHAUFFEUR")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chauffeur {

    @Id
    @Column(name = "ID_CHAUFFEUR", length = 20, nullable = false)
    private String idChauffeur;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false, unique = true)
    private Employe employe;

    @Column(name = "NUM_PERMIS", length = 30, nullable = false, unique = true)
    private String numPermis;

    @Column(name = "CATEGORIE_PERMIS", length = 10, nullable = false)
    @Builder.Default
    private String categoriePermis = "D";

    @Column(name = "DATE_EXPIRATION_PERMIS", nullable = false)
    private LocalDate dateExpirationPermis;

    @Column(name = "VISITE_MEDICALE_VALIDE", nullable = false)
    @Builder.Default
    private Boolean visiteMedicaleValide = true;
}

