package com.godtravel.backend.model.dto.paiement;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonetbilStatusView {
    private String statut;
    private String codeBillet;
    private String message;
}
