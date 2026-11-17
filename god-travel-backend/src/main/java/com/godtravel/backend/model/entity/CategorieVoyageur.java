package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CATEGORIE_VOYAGEUR")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieVoyageur {

    @Id
    @Column(name = "ID_CATEGORIE", length = 20, nullable = false)
    private String idCategorie;

    @Column(name = "CODE_CATEGORIE", length = 20, nullable = false, unique = true)
    private String codeCategorie;

    @Column(name = "LIBELLE_CATEGORIE", length = 50, nullable = false)
    private String libelleCategorie;

    @Column(name = "AGE_MIN")
    private Integer ageMin;

    @Column(name = "AGE_MAX")
    private Integer ageMax;
}

