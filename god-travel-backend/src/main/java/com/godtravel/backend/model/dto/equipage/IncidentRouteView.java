package com.godtravel.backend.model.dto.equipage;

import java.time.LocalDateTime;

public record IncidentRouteView(
        String idIncident,
        String idVoyage,
        String codeVoyage,
        LocalDateTime dateHeureIncident,
        String typeIncident,
        String descriptionDetaillee,
        Integer tempsRetardEstimeMin,
        String villeDepart,
        String villeArrivee
) {
}
