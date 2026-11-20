package com.godtravel.backend.model.dto.documents;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DocumentBusRequest(
        @NotBlank String idBus,
        @NotBlank String idTypeDoc,
        @NotBlank @Size(max = 50) String numeroPiece,
        @NotNull LocalDate dateEmission,
        @NotNull LocalDate dateExpiration,
        @Size(max = 255) String fichierScan
) {}
