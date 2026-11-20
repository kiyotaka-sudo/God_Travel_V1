package com.godtravel.backend.model.dto.promotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PromotionCodeRequest(@NotBlank @Size(max = 20) String codePromo) {}
