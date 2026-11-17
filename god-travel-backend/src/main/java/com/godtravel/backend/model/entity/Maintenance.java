package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "MAINTENANCE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {

    @Id
    @Column(name = "ID_MAINTENANCE", length = 20, nullable = false)
    private String idMaintenance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BUS", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false)
    private Employe employe;

    @Column(name = "DATE_MAINTENANCE", nullable = false)
    private LocalDate dateMaintenance;

    @Column(name = "NATURE_INTERVENTION", length = 100, nullable = false)
    private String natureIntervention;

    @Column(name = "COUT_INTERVENTION_XAF", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal coutInterventionXaf = BigDecimal.ZERO;

    @Column(name = "KILOMETRAGE_AU_MOMENT", nullable = false)
    private Integer kilometrageAuMoment;

    @Column(name = "OBSERVATIONS_MECANO", columnDefinition = "TEXT")
    private String observationsMecano;
}

