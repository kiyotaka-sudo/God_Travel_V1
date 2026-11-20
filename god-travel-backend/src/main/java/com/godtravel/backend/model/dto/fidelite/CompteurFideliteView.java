package com.godtravel.backend.model.dto.fidelite;

public record CompteurFideliteView(
        String idClient,
        String typeBilletCumule,
        int billetsCumules,
        int billetsRestantsAvantGratuit,
        int gratuitsAcquis,
        int gratuitsUtilises,
        int soldeGratuits
) {}
