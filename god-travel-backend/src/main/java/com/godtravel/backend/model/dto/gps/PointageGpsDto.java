package com.godtravel.backend.model.dto.gps;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointageGpsDto {

    @NotBlank(message = "L'identifiant balise est obligatoire")
    private String idBalise;

    @NotBlank(message = "Le voyage est obligatoire")
    private String idVoyage;

    @NotNull(message = "La latitude est obligatoire")
    private BigDecimal latitude;

    @NotNull(message = "La longitude est obligatoire")
    private BigDecimal longitude;

    private Integer vitesseKmh;
}

