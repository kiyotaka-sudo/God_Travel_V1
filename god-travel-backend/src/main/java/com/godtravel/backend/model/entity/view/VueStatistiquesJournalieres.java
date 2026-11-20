package com.godtravel.backend.model.entity.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "VW_STATISTIQUES_JOURNALIERES_DETAIL")
@Data
public class VueStatistiquesJournalieres {
    @Id @Column(name = "ID_STAT") private String idStat;
    @Column(name = "DATE_JOUR") private LocalDate dateJour;
    @Column(name = "CODE_AGENCE") private String codeAgence;
    @Column(name = "NOM_AGENCE") private String nomAgence;
    @Column(name = "CODE_LIGNE") private String codeLigne;
    @Column(name = "VILLE_DEPART") private String villeDepart;
    @Column(name = "VILLE_ARRIVEE") private String villeArrivee;
    @Column(name = "NB_BILLETS_VENDUS") private Integer nbBilletsVendus;
    @Column(name = "NB_BILLETS_GRATUITS") private Integer nbBilletsGratuits;
    @Column(name = "RECETTE_BILLETS_XAF", precision = 12, scale = 2) private BigDecimal recetteBilletsXaf;
    @Column(name = "RECETTE_COLIS_XAF", precision = 12, scale = 2) private BigDecimal recetteColisXaf;
    @Column(name = "RECETTE_COMBINEE_DECLAREE_XAF", precision = 12, scale = 2) private BigDecimal recetteCombineeDeclareeXaf;
    @Column(name = "TAUX_REMPLISSAGE_MOY") private BigDecimal tauxRemplissageMoy;
}
