package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MODE_PAIEMENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModePaiement {

    @Id
    @Column(name = "ID_MODE", length = 20, nullable = false)
    private String idMode;

    @Column(name = "CODE_MODE", length = 20, nullable = false, unique = true)
    private String codeMode;

    @Column(name = "LIBELLE_MODE", length = 50, nullable = false)
    private String libelleMode;

    @Column(name = "EN_LIGNE", nullable = false)
    @Builder.Default
    private Boolean enLigne = false;
}

