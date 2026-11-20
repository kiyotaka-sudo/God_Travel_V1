package com.godtravel.backend.model.dto.paiement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonetbilInitRequest {

    @NotBlank(message = "L'identifiant du billet ou colis est obligatoire")
    private String idItem; // idBillet ou idColis

    @NotBlank(message = "Le type d'item est obligatoire (BILLET ou COLIS)")
    @Builder.Default
    private String typeItem = "BILLET";

    @NotNull(message = "Le montant est obligatoire")
    private BigDecimal montant;

    @NotBlank(message = "Le numéro de téléphone du payeur est obligatoire")
    private String telephone; // ex: 699000000

    private String nomClient;
    private String emailClient;
    private String operateur; // ORANGE ou MTN; converti en code Monetbil Cameroun
}

