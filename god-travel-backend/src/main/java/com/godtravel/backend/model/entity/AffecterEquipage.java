package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AFFECTER_EQUIPAGE")
@IdClass(AffecterEquipageId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffecterEquipage {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_ROLE_VOYAGE", nullable = false)
    private RoleVoyage roleVoyage;

    @Column(name = "DATE_HEURE_PRISE_SERVICE")
    private LocalDateTime dateHeurePriseService;

    @Column(name = "OBSERVATIONS", length = 255)
    private String observations;
}
