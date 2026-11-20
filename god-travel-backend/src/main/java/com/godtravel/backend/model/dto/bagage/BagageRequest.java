package com.godtravel.backend.model.dto.bagage;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record BagageRequest(
        @NotBlank(message = "Le billet est obligatoire") String idBillet,
        @NotNull(message = "Le poids du bagage est obligatoire")
        @DecimalMin(value = "0.01", message = "Le poids doit être supérieur à zéro")
        @Digits(integer = 3, fraction = 2, message = "Le poids est limité à 999,99 kg") BigDecimal poidsKg,
        @Size(max = 100, message = "La description est limitée à 100 caractères") String description
) {
}
