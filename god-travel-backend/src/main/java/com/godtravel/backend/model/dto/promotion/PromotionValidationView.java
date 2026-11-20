package com.godtravel.backend.model.dto.promotion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PromotionValidationView(boolean valide, String codePromo, String libellePromo,
                                      String typeRemise, BigDecimal valeurRemise,
                                      LocalDate dateFin, int usagesRestants) {}
