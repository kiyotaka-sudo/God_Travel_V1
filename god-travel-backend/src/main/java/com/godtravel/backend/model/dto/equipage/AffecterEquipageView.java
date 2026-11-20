package com.godtravel.backend.model.dto.equipage;

import java.time.LocalDateTime;

public record AffecterEquipageView(
        String idVoyage,
        String idEmploye,
        String matricule,
        String nomComplet,
        String fonction,
        String codeRole,
        String libelleRole,
        LocalDateTime dateHeurePriseService,
        String observations
) {
}
