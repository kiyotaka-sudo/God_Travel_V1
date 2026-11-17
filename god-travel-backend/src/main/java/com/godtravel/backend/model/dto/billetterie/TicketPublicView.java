package com.godtravel.backend.model.dto.billetterie;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketPublicView {
    private String codeBillet;
    private String codeReservation;
    private String nomPassager;
    private String telephoneMasque;
    private String villeDepart;
    private String villeArrivee;
    private String immatriculationBus;
    private LocalDateTime departPrevu;
    private Integer numeroSiege;
    private BigDecimal montantXaf;
    private String statut;
    private String qrCodeBase64;
}
