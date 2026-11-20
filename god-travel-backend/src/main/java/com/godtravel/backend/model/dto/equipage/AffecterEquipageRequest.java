package com.godtravel.backend.model.dto.equipage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AffecterEquipageRequest(
        @NotBlank(message = "L’employé est obligatoire") String idEmploye,
        @NotBlank(message = "Le rôle dans le voyage est obligatoire") String codeRole,
        @Size(max = 255, message = "Les observations sont limitées à 255 caractères") String observations
) {
}
