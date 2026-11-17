package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "BILLET")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Billet {

    @Id
    @Column(name = "ID_BILLET", length = 20, nullable = false)
    private String idBillet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENT", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CATEGORIE", nullable = false)
    private CategorieVoyageur categorieVoyageur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE")
    private Employe employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PROMOTION")
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE_VALIDATEUR_GRATUITE")
    private Employe employeValidateurGratuite;

    @Column(name = "CODE_BILLET", length = 30, nullable = false, unique = true)
    private String codeBillet;

    @Column(name = "CODE_RESERVATION", length = 20, nullable = false)
    private String codeReservation;

    @Column(name = "NUM_SIEGE", nullable = false)
    private Integer numSiege;

    @Column(name = "TYPE_BILLET", length = 20, nullable = false)
    @Builder.Default
    private String typeBillet = "ALLER_SIMPLE";

    @Column(name = "CANAL_VENTE", length = 20, nullable = false)
    @Builder.Default
    private String canalVente = "GUICHET";

    @Column(name = "DATE_EMISSION", nullable = false)
    @Builder.Default
    private LocalDateTime dateEmission = LocalDateTime.now();

    @Column(name = "DATE_VALIDITE", nullable = false)
    private LocalDate dateValidite;

    @Column(name = "PRIX_APPLIQUE_XAF", precision = 12, scale = 2, nullable = false)
    private BigDecimal prixAppliqueXaf;

    @Column(name = "EST_GRATUIT", nullable = false)
    @Builder.Default
    private Boolean estGratuit = false;

    @Column(name = "MOTIF_GRATUITE", length = 255)
    private String motifGratuite;

    @Column(name = "VOYAGE_PAR_TIERS", nullable = false)
    @Builder.Default
    private Boolean voyageParTiers = false;

    @Column(name = "NOM_TIERS", length = 50)
    private String nomTiers;

    @Column(name = "PRENOM_TIERS", length = 50)
    private String prenomTiers;

    @Column(name = "COPIE_PIECE_VERIFIEE", nullable = false)
    @Builder.Default
    private Boolean copiePieceVerifiee = true;

    @Column(name = "SIGNATURE_HMAC", length = 128, nullable = false)
    private String signatureHmac;

    @Column(name = "STATUT_BILLET", length = 20, nullable = false)
    @Builder.Default
    private String statutBillet = "VALIDE";
}

