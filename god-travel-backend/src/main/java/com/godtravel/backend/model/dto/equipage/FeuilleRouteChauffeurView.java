package com.godtravel.backend.model.dto.equipage;

import java.time.LocalDateTime;

public record FeuilleRouteChauffeurView(
        String idVoyage,
        String codeVoyage,
        String statutVoyage,
        LocalDateTime departPrevu,
        LocalDateTime arriveePrevue,
        String codeLigne,
        String villeDepart,
        String villeArrivee,
        String immatriculationBus,
        String classeBus,
        String roleVoyage,
        long passagersPrevus
) {
}
