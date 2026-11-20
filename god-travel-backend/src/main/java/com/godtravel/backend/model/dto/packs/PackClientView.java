package com.godtravel.backend.model.dto.packs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PackClientView(String idPackClient, String codePack, String libellePack, int voyagesInclus,
                             BigDecimal prixPackXaf, LocalDateTime dateAchat, LocalDate dateExpiration,
                             int voyagesRestants, boolean estEpuise, boolean estExpire) {}
