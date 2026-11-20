package com.godtravel.backend.model.dto.colis;

import java.math.BigDecimal;

public record EstimationFretDto(
        BigDecimal poidsKg,
        BigDecimal valeurDeclaree,
        BigDecimal tarifBaseXaf,
        BigDecimal tarifPoidsXaf,
        BigDecimal tarifAssuranceXaf,
        BigDecimal totalXaf
) {
}
