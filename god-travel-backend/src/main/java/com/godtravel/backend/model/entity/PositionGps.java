package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "POSITION_GPS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionGps {

    @Id
    @Column(name = "ID_POSITION", length = 20, nullable = false)
    private String idPosition;

    @Column(name = "ID_BALISE", length = 20, nullable = false)
    private String idBalise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @Column(name = "DATE_HEURE_RELEVE", nullable = false)
    @Builder.Default
    private LocalDateTime dateHeureReleve = LocalDateTime.now();

    @Column(name = "LATITUDE", precision = 9, scale = 6, nullable = false)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 9, scale = 6, nullable = false)
    private BigDecimal longitude;

    @Column(name = "VITESSE_KMH")
    private Integer vitesseKmh;
}

