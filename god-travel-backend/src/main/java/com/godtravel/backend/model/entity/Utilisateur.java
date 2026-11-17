package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "UTILISATEUR")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @Column(name = "ID_UTILISATEUR", length = 20, nullable = false)
    private String idUtilisateur;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_EMPLOYE", nullable = false)
    private Employe employe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_PROFIL", nullable = false)
    private Profil profil;

    @Column(name = "LOGIN", length = 50, nullable = false, unique = true)
    private String login;

    @Column(name = "MOT_DE_PASSE_HASH", length = 255, nullable = false)
    private String motDePasseHash;

    @Column(name = "SEL_CRYPTOGRAPHIQUE", length = 64)
    private String selCryptographique;

    @Column(name = "EST_ACTIF", nullable = false)
    @Builder.Default
    private Boolean estActif = true;

    @Column(name = "TENTATIVES_ECHEC", nullable = false)
    @Builder.Default
    private Integer tentativesEchec = 0;

    @Column(name = "VERROUILLE_JUSQUA")
    private LocalDateTime verrouilleJusqua;

    @Column(name = "DERNIERE_CONNEXION")
    private LocalDateTime derniereConnexion;
}

