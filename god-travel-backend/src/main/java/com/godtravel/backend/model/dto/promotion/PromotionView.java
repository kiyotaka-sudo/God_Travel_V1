package com.godtravel.backend.model.dto.promotion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PromotionView(String codePromo, String libellePromo, String typeRemise, BigDecimal valeurRemise,
                            LocalDate dateDebut, LocalDate dateFin, int usagesMax, int usagesActuels,
                            boolean estActive) {}
