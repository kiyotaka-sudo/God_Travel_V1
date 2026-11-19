package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLIS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Colis implements Persistable<String> {

    @Id
    @Column(name = "ID_COLIS", length = 20, nullable = false)
    private String idColis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENT_EXPEDITEUR", nullable = false)
    private Client clientExpediteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE_DEPOT", nullable = false)
    private Agence agenceDepot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AGENCE_RETRAIT", nullable = false)
    private Agence agenceRetrait;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE")
    private Voyage voyage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false)
    private Employe employe;

    @Column(name = "CODE_SUIVI", length = 30, nullable = false, unique = true)
    private String codeSuivi;

    @Column(name = "NOM_DESTINATAIRE", length = 50, nullable = false)
    private String nomDestinataire;

    @Column(name = "PRENOM_DESTINATAIRE", length = 50)
    private String prenomDestinataire;

    @Column(name = "TELEPHONE_DESTINATAIRE", length = 20, nullable = false)
    private String telephoneDestinataire;

    @Column(name = "CNI_DESTINATAIRE", length = 30)
    private String cniDestinataire;

    @Column(name = "DESCRIPTION_CONTENU", length = 255, nullable = false)
    private String descriptionContenu;

    @Column(name = "VALEUR_DECLAREE_XAF", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal valeurDeclareeXaf = BigDecimal.ZERO;

    @Column(name = "POIDS_KG", precision = 6, scale = 2, nullable = false)
    private BigDecimal poidsKg;

    @Column(name = "FRAIS_EXPEDITION_XAF", precision = 12, scale = 2, nullable = false)
    private BigDecimal fraisExpeditionXaf;

    @Column(name = "DATE_ENREGISTREMENT", nullable = false)
    @Builder.Default
    private LocalDateTime dateEnregistrement = LocalDateTime.now();

    @Column(name = "DATE_REMISE")
    private LocalDateTime dateRemise;

    @Column(name = "STATUT_COLIS", length = 20, nullable = false)
    @Builder.Default
    private String statutColis = "ENREGISTRE";

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public String getId() {
        return idColis;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}

