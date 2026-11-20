package com.godtravel.backend.model.entity.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "VW_DOCUMENTS_BUS_ECHEANCE")
@Data
public class VueDocumentsBusEcheance {
    @Id @Column(name = "ID_DOCUMENT") private String idDocument;
    @Column(name = "ID_BUS") private String idBus;
    @Column(name = "IMMATRICULATION") private String immatriculation;
    @Column(name = "MARQUE") private String marque;
    @Column(name = "MODELE") private String modele;
    @Column(name = "CODE_TYPE") private String codeType;
    @Column(name = "LIBELLE_TYPE") private String libelleType;
    @Column(name = "DATE_EMISSION") private LocalDate dateEmission;
    @Column(name = "DATE_EXPIRATION") private LocalDate dateExpiration;
    @Column(name = "EST_VALIDE") private Boolean estValide;
    @Column(name = "JOURS_AVANT_EXPIRATION") private Integer joursAvantExpiration;
    @Column(name = "ETAT_ECHEANCE") private String etatEcheance;
}
