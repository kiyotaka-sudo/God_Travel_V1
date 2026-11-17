package com.godtravel.backend.model.dto.auth;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private String idUtilisateur;
    private String login;
    private String nomComplet;
    private String role;
    private String idAgence;
    private String nomAgence;
    private String telephone;
}

