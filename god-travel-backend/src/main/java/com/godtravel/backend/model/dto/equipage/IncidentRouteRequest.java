package com.godtravel.backend.model.dto.equipage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IncidentRouteRequest(
        @NotBlank(message = "Le voyage est obligatoire") String idVoyage,
        @NotBlank(message = "Le type d’incident est obligatoire") String typeIncident,
        @NotBlank(message = "La description est obligatoire")
        @Size(max = 255, message = "La description est limitée à 255 caractères") String descriptionDetaillee,
        @NotNull(message = "Le retard estimé est obligatoire")
        @Min(value = 0, message = "Le retard ne peut pas être négatif") Integer tempsRetardEstimeMin
) {
}
