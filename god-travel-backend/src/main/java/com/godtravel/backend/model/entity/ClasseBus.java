package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CLASSE_BUS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClasseBus {

    @Id
    @Column(name = "ID_CLASSE", length = 20, nullable = false)
    private String idClasse;

    @Column(name = "CODE_CLASSE", length = 10, nullable = false, unique = true)
    private String codeClasse;

    @Column(name = "LIBELLE_CLASSE", length = 50, nullable = false)
    private String libelleClasse;

    @Column(name = "EQUIPEMENTS_INCLUS", length = 255)
    private String equipementsInclus;
}

