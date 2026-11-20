package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;

@Entity
@Table(name = "PACK")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pack implements Persistable<String> {
    @Id
    @Column(name = "ID_PACK", length = 20, nullable = false)
    private String idPack;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPAGNIE", nullable = false)
    private Compagnie compagnie;

    @Column(name = "CODE_PACK", length = 30, nullable = false, unique = true)
    private String codePack;

    @Column(name = "LIBELLE_PACK", length = 100, nullable = false)
    private String libellePack;

    @Column(name = "NB_VOYAGES_INCLUS", nullable = false)
    private Integer nbVoyagesInclus;

    @Column(name = "PRIX_PACK_XAF", precision = 12, scale = 2, nullable = false)
    private BigDecimal prixPackXaf;

    @Column(name = "DUREE_VALIDITE_JOURS", nullable = false)
    @Builder.Default
    private Integer dureeValiditeJours = 90;

    @Column(name = "EST_ACTIF", nullable = false)
    @Builder.Default
    private Boolean estActif = true;

    @Transient @Builder.Default private boolean isNew = true;
    @Override public String getId() { return idPack; }
    @Override public boolean isNew() { return isNew; }
    @PostLoad @PostPersist void markNotNew() { isNew = false; }
}
