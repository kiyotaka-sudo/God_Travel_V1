package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;

@Entity
@Table(name = "BAGAGE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bagage implements Persistable<String> {

    @Id
    @Column(name = "ID_BAGAGE", length = 20, nullable = false)
    private String idBagage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BILLET", nullable = false)
    private Billet billet;

    @Column(name = "NUMERO_ETIQUETTE", length = 30, nullable = false, unique = true)
    private String numeroEtiquette;

    @Column(name = "POIDS_KG", precision = 5, scale = 2, nullable = false)
    private BigDecimal poidsKg;

    @Column(name = "FRAIS_SUPPLEMENTAIRES_XAF", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal fraisSupplementairesXaf = BigDecimal.ZERO;

    @Column(name = "DESCRIPTION", length = 100)
    private String description;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public String getId() {
        return idBagage;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
