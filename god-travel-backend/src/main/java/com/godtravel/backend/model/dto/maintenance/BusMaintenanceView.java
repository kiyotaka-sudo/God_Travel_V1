package com.godtravel.backend.model.dto.maintenance;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BusMaintenanceView {
    String idBus;
    String immatriculation;
    String marque;
    String modele;
    Integer kilometrageTotal;
}
