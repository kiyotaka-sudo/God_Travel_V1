package com.godtravel.backend.model.dto.maintenance;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceRequest {
    @NotBlank private String idBus;
    @NotNull private LocalDate dateMaintenance;
    @NotBlank @Size(max = 100) private String natureIntervention;
    @NotNull @DecimalMin("0.00") private BigDecimal coutInterventionXaf;
    @NotNull @Min(0) private Integer kilometrageAuMoment;
    private String observationsMecano;
}
