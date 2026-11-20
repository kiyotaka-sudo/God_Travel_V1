package com.godtravel.backend.model.entity.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "VW_BILLETTERIE_PAR_VOYAGE")
@Data
public class VueBilletterieParVoyage {
    @Id @Column(name = "ID_VOYAGE") private String idVoyage;
    @Column(name = "CODE_VOYAGE") private String codeVoyage;
    @Column(name = "STATUT_VOYAGE") private String statutVoyage;
    @Column(name = "DATE_HEURE_DEPART_PREVUE") private LocalDateTime dateHeureDepartPrevue;
    @Column(name = "CODE_LIGNE") private String codeLigne;
    @Column(name = "VILLE_DEPART") private String villeDepart;
    @Column(name = "VILLE_ARRIVEE") private String villeArrivee;
    @Column(name = "CAPACITE_BUS") private Integer capaciteBus;
    @Column(name = "NB_BILLETS_ENREGISTRES") private Long nbBilletsEnregistres;
    @Column(name = "NB_BILLETS_GRATUITS") private Long nbBilletsGratuits;
    @Column(name = "NB_BILLETS_PAYANTS") private Long nbBilletsPayants;
    @Column(name = "ECART_CAPACITE_MOINS_BILLETS") private Long ecartCapaciteMoinsBillets;
    @Column(name = "TAUX_BILLETS_ENREGISTRES_PCT") private BigDecimal tauxBilletsEnregistresPct;
}
