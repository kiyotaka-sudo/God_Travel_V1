package com.godtravel.backend.model.dto.caisse;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CaisseTransactionView {
    private String reference;
    private String libelle;
    private String mode;
    private BigDecimal montantXaf;
    private String statut;
    private LocalDateTime datePaiement;
}
