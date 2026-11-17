package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "AGENCE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agence {

    @Id
    @Column(name = "ID_AGENCE", length = 20, nullable = false)
    private String idAgence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPAGNIE", nullable = false)
    private Compagnie compagnie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VILLE", nullable = false)
    private Ville ville;

    @Column(name = "NOM_AGENCE", length = 100, nullable = false)
    private String nomAgence;

    @Column(name = "CODE_AGENCE", length = 10, nullable = false, unique = true)
    private String codeAgence;

    @Column(name = "ADRESSE_QUARTIER", length = 100)
    private String adresseQuartier;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "ONDULEUR_CONFORME", nullable = false)
    @Builder.Default
    private Boolean onduleurConforme = true;
}

