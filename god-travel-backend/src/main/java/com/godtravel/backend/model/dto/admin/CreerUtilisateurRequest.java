package com.godtravel.backend.model.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreerUtilisateurRequest {
    @NotBlank @Size(max = 50) private String prenom;
    @NotBlank @Size(max = 50) private String nom;
    @NotBlank @Size(max = 30) private String numeroCni;
    @NotBlank @Size(max = 20) private String telephone;
    @NotBlank @Size(max = 50) private String fonction;
    @NotBlank private String idAgence;
    @NotBlank @Email @Size(max = 50) private String login;
    @NotBlank @Size(min = 10, max = 72) private String motDePasse;
    @NotBlank @Size(max = 30) private String codeProfil;
}
