package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMBARQUEMENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Embarquement {

    @Id
    @Column(name = "ID_EMBARQUEMENT", length = 20, nullable = false)
    private String idEmbarquement;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BILLET", nullable = false, unique = true)
    private Billet billet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false)
    private Employe employe;

    @Column(name = "DATE_HEURE_SCAN", nullable = false)
    @Builder.Default
    private LocalDateTime dateHeureScan = LocalDateTime.now();

    @Column(name = "TERMINAL_SCAN", length = 50)
    private String terminalScan;

    @Column(name = "EST_CONFORME", nullable = false)
    @Builder.Default
    private Boolean estConforme = true;
}

