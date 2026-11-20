package com.godtravel.backend.model.dto.documents;

import java.time.LocalDate;

public record DocumentBusView(String idDocument, String idBus, String immatriculation, String marque, String modele,
                              String codeType, String libelleType, LocalDate dateEmission, LocalDate dateExpiration,
                              boolean estValide, int joursAvantExpiration, String etatEcheance) {}
