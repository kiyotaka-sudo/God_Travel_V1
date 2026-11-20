package com.godtravel.backend.model.dto.bagage;

import java.math.BigDecimal;

public record BagageView(
        String idBagage,
        String idBillet,
        String codeBillet,
        String numeroEtiquette,
        BigDecimal poidsKg,
        BigDecimal fraisSupplementairesXaf,
        String description
) {
}
