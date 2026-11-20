package com.godtravel.backend.model.dto.billetterie;

import java.time.LocalDateTime;

public record VerrouSiegeResponse(
        String idVerrou,
        String idVoyage,
        Integer numSiege,
        LocalDateTime dateExpirationVerrou,
        long secondesRestantes
) {
}
