package com.godtravel.backend.model.dto.billetterie;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VerrouSiegeRequest(
        @NotNull(message = "Le numéro de siège est obligatoire")
        @Min(value = 1, message = "Le siège doit être au minimum 1")
        Integer numSiege
) {
}
