package com.godtravel.backend.model.dto.equipage;

import java.time.LocalDateTime;

public record VoyageEquipageView(
        String idVoyage,
        String codeVoyage,
        LocalDateTime dateHeureDepartPrevue,
        String statutVoyage,
        String codeLigne,
        String villeDepart,
        String villeArrivee,
        String immatriculationBus
) {
}
