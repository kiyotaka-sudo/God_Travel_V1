package com.godtravel.backend.model.entity.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "VUE_RELEVE_CAISSE_JOURNALIER")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VueReleveCaisseJournalier {

    @Id
    @Column(name = "ID_CLOTURE")
    private String idCloture;

    @Column(name = "DATE_CLOTURE")
    private LocalDate dateCloture;

    @Column(name = "HEURE_OUVERTURE")
    private LocalTime heureOuverture;

    @Column(name = "HEURE_FERMETURE")
    private LocalTime heureFermeture;

    @Column(name = "NOM_AGENCE")
    private String nomAgence;

    @Column(name = "MATRICULE_GUICHETIER")
    private String matriculeGuichetier;

    @Column(name = "NOM_GUICHETIER")
    private String nomGuichetier;

    @Column(name = "NOM_CHEF_VALIDATEUR")
    private String nomChefValidateur;

    @Column(name = "MONTANT_THEORIQUE_XAF")
    private BigDecimal montantTheoriqueXaf;

    @Column(name = "MONTANT_COMPTE_XAF")
    private BigDecimal montantCompteXaf;

    @Column(name = "ECART_CONSTATE_XAF")
    private BigDecimal ecartConstateXaf;

    @Column(name = "TOTAL_ENCAISSEMENTS")
    private BigDecimal totalEncaissements;

    @Column(name = "OBSERVATION_CLOTURE")
    private String observationCloture;
}

