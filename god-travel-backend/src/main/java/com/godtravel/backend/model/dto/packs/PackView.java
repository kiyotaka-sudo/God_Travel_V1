package com.godtravel.backend.model.dto.packs;

import java.math.BigDecimal;

public record PackView(String idPack, String codePack, String libellePack, int nbVoyagesInclus,
                       BigDecimal prixPackXaf, int dureeValiditeJours) {}
