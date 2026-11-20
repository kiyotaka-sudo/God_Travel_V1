package com.godtravel.backend.model.dto.embarquement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ValiderEmbarquementRequest(
        @NotBlank
        @Size(max = 30)
        String codeBillet,

        @Size(max = 50)
        String terminalScan
) {
}
