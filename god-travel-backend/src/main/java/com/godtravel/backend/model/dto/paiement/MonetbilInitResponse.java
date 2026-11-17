package com.godtravel.backend.model.dto.paiement;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonetbilInitResponse {
    private boolean success;
    private String idPaiement;
    private String referenceTransaction;
    private String paymentUrl;
    private String message;
    private String status; // PENDING, SUCCESS
}

