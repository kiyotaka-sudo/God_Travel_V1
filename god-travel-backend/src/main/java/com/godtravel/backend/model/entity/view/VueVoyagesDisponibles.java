package com.godtravel.backend.model.entity.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "VUE_VOYAGES_DISPONIBLES")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VueVoyagesDisponibles {

    @Id
    @Column(name = "ID_VOYAGE")
    private String idVoyage;

    @Column(name = "CODE_VOYAGE")
    private String codeVoyage;

    @Column(name = "DATE_HEURE_DEPART_PREVUE")
    private LocalDateTime dateHeureDepartPrevue;

    @Column(name = "DATE_HEURE_ARRIVEE_PREVUE")
    private LocalDateTime dateHeureArriveePrevue;

    @Column(name = "STATUT_VOYAGE")
    private String statutVoyage;

    @Column(name = "CODE_LIGNE")
    private String codeLigne;

    @Column(name = "VILLE_DEPART")
    private String villeDepart;

    @Column(name = "VILLE_ARRIVEE")
    private String villeArrivee;

    @Column(name = "BUS_IMMATRICULATION")
    private String busImmatriculation;

    @Column(name = "CAPACITE_TOTALE")
    private Integer capaciteTotale;

    @Column(name = "CLASSE_BUS")
    private String classeBus;

    @Column(name = "AGENCE_DEPART")
    private String agenceDepart;

    @Column(name = "PLACES_OCCUPEES")
    private Long placesOccupees;

    @Column(name = "PLACES_RESTANTES")
    private Long placesRestantes;

    @Column(name = "TARIF_BASE_XAF")
    private BigDecimal tarifBaseXaf;
}

