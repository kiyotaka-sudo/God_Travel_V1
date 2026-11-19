package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAIEMENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paiement implements Persistable<String> {

    @Id
    @Column(name = "ID_PAIEMENT", length = 20, nullable = false)
    private String idPaiement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MODE", nullable = false)
    private ModePaiement modePaiement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLOTURE")
    private ClotureCaisse clotureCaisse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BILLET")
    private Billet billet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COLIS")
    private Colis colis;

    @Column(name = "ID_PACK_CLIENT", length = 20)
    private String idPackClient;

    @Column(name = "REFERENCE_TRANSACTION", length = 50, nullable = false)
    private String referenceTransaction;

    @Column(name = "MONTANT_PAYE_XAF", precision = 12, scale = 2, nullable = false)
    private BigDecimal montantPayeXaf;

    @Column(name = "DATE_PAIEMENT", nullable = false)
    @Builder.Default
    private LocalDateTime datePaiement = LocalDateTime.now();

    @Column(name = "STATUT_PAIEMENT", length = 20, nullable = false)
    @Builder.Default
    private String statutPaiement = "VALIDE";

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public String getId() {
        return idPaiement;
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

