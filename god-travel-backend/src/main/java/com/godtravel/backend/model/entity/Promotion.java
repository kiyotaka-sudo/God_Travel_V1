package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PROMOTION")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @Column(name = "ID_PROMOTION", length = 20, nullable = false)
    private String idPromotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPAGNIE", nullable = false)
    private Compagnie compagnie;

    @Column(name = "CODE_PROMO", length = 20, nullable = false, unique = true)
    private String codePromo;

    @Column(name = "LIBELLE_PROMO", length = 100, nullable = false)
    private String libellePromo;

    @Column(name = "TYPE_REMISE", length = 20, nullable = false)
    private String typeRemise;

    @Column(name = "VALEUR_REMISE", precision = 12, scale = 2, nullable = false)
    private BigDecimal valeurRemise;

    @Column(name = "DATE_DEBUT", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "DATE_FIN", nullable = false)
    private LocalDate dateFin;

    @Column(name = "USAGES_MAX", nullable = false)
    @Builder.Default
    private Integer usagesMax = 100;

    @Column(name = "USAGES_ACTUELS", nullable = false)
    @Builder.Default
    private Integer usagesActuels = 0;

    @Column(name = "EST_ACTIVE", nullable = false)
    @Builder.Default
    private Boolean estActive = true;
}

