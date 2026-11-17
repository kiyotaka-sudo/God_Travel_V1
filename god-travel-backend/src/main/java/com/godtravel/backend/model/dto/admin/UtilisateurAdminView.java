package com.godtravel.backend.model.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UtilisateurAdminView {
    private String idUtilisateur;
    private String login;
    private String nomComplet;
    private String role;
    private String agence;
    private boolean actif;
}
