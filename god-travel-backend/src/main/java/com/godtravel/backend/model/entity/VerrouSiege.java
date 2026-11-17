package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "VERROU_SIEGE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerrouSiege {

    @Id
    @Column(name = "ID_VERROU", length = 20, nullable = false)
    private String idVerrou;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_VOYAGE", nullable = false)
    private Voyage voyage;

    @Column(name = "NUM_SIEGE", nullable = false)
    private Integer numSiege;

    @Column(name = "DATE_EXPIRATION_VERROU", nullable = false)
    private LocalDateTime dateExpirationVerrou;

    @Column(name = "PLAGE_SECOURS_AGENCE", length = 20)
    private String plageSecoursAgence;
}

