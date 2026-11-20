package com.godtravel.backend.model.dto.promotion;

import com.godtravel.backend.model.entity.Promotion;

import java.math.BigDecimal;

public record PromotionApplication(Promotion promotion, BigDecimal remiseXaf, BigDecimal prixFinalXaf) {}
