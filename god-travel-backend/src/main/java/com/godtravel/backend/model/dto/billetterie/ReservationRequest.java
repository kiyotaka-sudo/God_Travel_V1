package com.godtravel.backend.model.dto.billetterie;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    @NotBlank(message = "Le voyage est obligatoire")
    private String idVoyage;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String nomClient;

    private String prenomClient;

    @NotBlank(message = "Le téléphone du client est obligatoire")
    private String telephoneClient;

    private String cniClient;

    @NotNull(message = "Le numéro de siège est obligatoire")
    @Min(value = 1, message = "Le siège doit être au minimum 1")
    private Integer numSiege;

    private String idCategorie; // ex: CAT-ADULTE

    private String idModePaiement; // ex: MODE-ESP, MODE-OM, MODE-MOMO

    private String idClotureCaisse;

    private BigDecimal montantPaye;

    @Size(max = 20, message = "Le code promo est limité à 20 caractères")
    private String codePromo;
}

