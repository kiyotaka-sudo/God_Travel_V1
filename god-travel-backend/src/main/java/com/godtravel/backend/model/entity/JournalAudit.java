package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "JOURNAL_AUDIT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalAudit {

    @Id
    @Column(name = "ID_AUDIT", length = 20, nullable = false)
    private String idAudit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTILISATEUR")
    private Utilisateur utilisateur;

    @Column(name = "DATE_HEURE_ACTION", nullable = false)
    @Builder.Default
    private LocalDateTime dateHeureAction = LocalDateTime.now();

    @Column(name = "TYPE_ACTION", length = 50, nullable = false)
    private String typeAction;

    @Column(name = "TABLE_CIBLE", length = 50, nullable = false)
    private String tableCible;

    @Column(name = "ID_ENREGISTREMENT_CIBLE", length = 50)
    private String idEnregistrementCible;

    @Column(name = "ANCIENNE_VALEUR", columnDefinition = "TEXT")
    private String ancienneValeur;

    @Column(name = "NOUVELLE_VALEUR", columnDefinition = "TEXT")
    private String nouvelleValeur;

    @Column(name = "ADRESSE_IP", length = 45)
    private String adresseIp;
}

