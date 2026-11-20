package com.godtravel.backend.model.dto.colis;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record EstimationFretRequest(
        @NotNull(message = "Le poids est obligatoire")
        @DecimalMin(value = "0.1", message = "Le poids minimum est de 0,1 kg")
        @Digits(integer = 4, fraction = 2, message = "Le poids est invalide") BigDecimal poidsKg,
        @DecimalMin(value = "0.0", message = "La valeur déclarée ne peut pas être négative")
        @Digits(integer = 10, fraction = 2, message = "La valeur déclarée est invalide") BigDecimal valeurDeclaree
) {
}
