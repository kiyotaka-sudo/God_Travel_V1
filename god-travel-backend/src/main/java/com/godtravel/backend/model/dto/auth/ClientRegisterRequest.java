package com.godtravel.backend.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ClientRegisterRequest {
    @NotBlank @Size(max = 50) private String nom;
    @NotBlank @Size(max = 50) private String prenom;
    @NotBlank @Size(max = 20) private String telephone;
    @NotBlank @Email @Size(max = 120) private String email;
    @NotBlank @Size(min = 8, max = 72) private String password;
}
