package com.godtravel.backend.model.entity.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "VUE_EMBARQUEMENT_PASSAGERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VueEmbarquementPassagers {

    @Id
    @Column(name = "ID_BILLET", length = 20)
    private String idBillet;

    @Column(name = "CODE_BILLET", length = 30)
    private String codeBillet;

    @Column(name = "NUM_SIEGE")
    private Integer numSiege;

    @Column(name = "STATUT_BILLET", length = 20)
    private String statutBillet;

    @Column(name = "PASSAGER_NOM", length = 50)
    private String passagerNom;

    @Column(name = "PASSAGER_PRENOM", length = 50)
    private String passagerPrenom;

    @Column(name = "NUMERO_CNI", length = 30)
    private String numeroCni;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "ID_VOYAGE", length = 20)
    private String idVoyage;

    @Column(name = "CODE_VOYAGE", length = 30)
    private String codeVoyage;

    @Column(name = "BUS_IMMATRICULATION", length = 20)
    private String busImmatriculation;

    @Column(name = "ID_EMBARQUEMENT", length = 20)
    private String idEmbarquement;

    @Column(name = "DATE_HEURE_SCAN")
    private LocalDateTime dateHeureScan;

    @Column(name = "TERMINAL_SCAN", length = 50)
    private String terminalScan;

    @Column(name = "EST_CONFORME")
    private Boolean estConforme;
}
