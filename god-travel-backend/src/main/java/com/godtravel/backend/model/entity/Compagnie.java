package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COMPAGNIE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Compagnie {

    @Id
    @Column(name = "ID_COMPAGNIE", length = 20, nullable = false)
    private String idCompagnie;

    @Column(name = "RAISON_SOCIALE", length = 100, nullable = false)
    private String raisonSociale;

    @Column(name = "SIGLE", length = 20, nullable = false, unique = true)
    private String sigle;

    @Column(name = "NUM_CONTRIBUABLE", length = 30, nullable = false)
    private String numContribuable;

    @Column(name = "REGISTRE_COMMERCE", length = 50)
    private String registreCommerce;

    @Column(name = "ADRESSE_SIEGE", length = 150)
    private String adresseSiege;

    @Column(name = "TELEPHONE", length = 20, nullable = false)
    private String telephone;

    @Column(name = "EMAIL_CONTACT", length = 100)
    private String emailContact;

    @Column(name = "CLE_HMAC_SECURITE", length = 128, nullable = false)
    private String cleHmacSecurite;

    @Column(name = "STATUT_ACTIF", nullable = false)
    @Builder.Default
    private Boolean statutActif = true;
}

