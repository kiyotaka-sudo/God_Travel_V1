package com.godtravel.backend.model.dto.maintenance;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class MaintenanceView {
    String idMaintenance;
    String idBus;
    String immatriculation;
    String marque;
    String modele;
    String natureIntervention;
    BigDecimal coutInterventionXaf;
    Integer kilometrageAuMoment;
    LocalDate dateMaintenance;
    String mecanicien;
    String observationsMecano;
}
