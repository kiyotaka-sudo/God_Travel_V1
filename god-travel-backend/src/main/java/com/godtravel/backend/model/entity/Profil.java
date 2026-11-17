package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PROFIL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profil {

    @Id
    @Column(name = "ID_PROFIL", length = 20, nullable = false)
    private String idProfil;

    @Column(name = "CODE_PROFIL", length = 30, nullable = false, unique = true)
    private String codeProfil;

    @Column(name = "LIBELLE_PROFIL", length = 50, nullable = false)
    private String libelleProfil;

    @Column(name = "DESCRIPTION_ROLES", length = 255)
    private String descriptionRoles;
}

