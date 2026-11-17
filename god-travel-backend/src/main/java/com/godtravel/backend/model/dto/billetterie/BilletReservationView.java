package com.godtravel.backend.model.dto.billetterie;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BilletReservationView {
    private String idBillet;
    private String codeBillet;
    private String codeReservation;
    private String statutBillet;
    private String telephoneClient;
    private Integer numeroSiege;
    private BigDecimal montantXaf;
}
