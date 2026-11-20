package com.godtravel.backend.model.dto.colis;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColisCreationRequest {

    @NotBlank(message = "Le nom de l'expéditeur est obligatoire")
    private String nomExpediteur;

    @NotBlank(message = "Le téléphone de l'expéditeur est obligatoire")
    private String telephoneExpediteur;

    @NotBlank(message = "L'agence de retrait/destination est obligatoire")
    private String idAgenceRetrait;

    @NotBlank(message = "Le nom du destinataire est obligatoire")
    private String nomDestinataire;

    private String prenomDestinataire;

    @NotBlank(message = "Le téléphone du destinataire est obligatoire")
    private String telephoneDestinataire;

    private String cniDestinataire;

    @NotBlank(message = "La description du contenu est obligatoire")
    private String descriptionContenu;

    @NotNull(message = "Le poids est obligatoire")
    @DecimalMin(value = "0.1", message = "Poids minimum 0.1 kg")
    @Digits(integer = 4, fraction = 2, message = "Le poids est invalide")
    private BigDecimal poidsKg;

    @DecimalMin(value = "0.0", message = "La valeur déclarée ne peut pas être négative")
    @Digits(integer = 10, fraction = 2, message = "La valeur déclarée est invalide")
    private BigDecimal valeurDeclaree;

    // Champ historique accepté pour compatibilité avec les anciens clients, ignoré par le serveur.
    private BigDecimal fraisExpedition;

    private String idVoyage;
}

