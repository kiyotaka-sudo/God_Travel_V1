package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ALERTE_GPS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlerteGps {

    @Id
    @Column(name = "ID_ALERTE_GPS", length = 20, nullable = false)
    private String idAlerteGps;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @Column(name = "TYPE_ALERTE", length = 50, nullable = false)
    private String typeAlerte;

    @Column(name = "DATE_HEURE_ALERTE", nullable = false)
    @Builder.Default
    private LocalDateTime dateHeureAlerte = LocalDateTime.now();

    @Column(name = "MESSAGE_ALERTE", length = 255, nullable = false)
    private String messageAlerte;

    @Column(name = "EST_ACQUITTEE", nullable = false)
    @Builder.Default
    private Boolean estAcquittee = false;
}

