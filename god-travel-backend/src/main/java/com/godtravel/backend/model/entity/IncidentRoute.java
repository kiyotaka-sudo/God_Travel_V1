package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "INCIDENT_ROUTE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRoute {

    @Id
    @Column(name = "ID_INCIDENT", length = 20, nullable = false)
    private String idIncident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @Column(name = "DATE_HEURE_INCIDENT", nullable = false)
    @Builder.Default
    private LocalDateTime dateHeureIncident = LocalDateTime.now();

    @Column(name = "TYPE_INCIDENT", length = 50, nullable = false)
    private String typeIncident;

    @Column(name = "DESCRIPTION_DETAILLEE", length = 255, nullable = false)
    private String descriptionDetaillee;

    @Column(name = "TEMPS_RETARD_ESTIME_MIN", nullable = false)
    private Integer tempsRetardEstimeMin;
}

