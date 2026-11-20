package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "COMPTEUR_FIDELITE", uniqueConstraints = @UniqueConstraint(
        name = "uk_compteur_client_type", columnNames = {"ID_CLIENT", "TYPE_BILLET_CUMULE"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompteurFidelite implements Persistable<String> {
    @Id
    @Column(name = "ID_COMPTEUR", length = 20, nullable = false)
    private String idCompteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENT", nullable = false)
    private Client client;

    @Column(name = "TYPE_BILLET_CUMULE", length = 20, nullable = false)
    @Builder.Default
    private String typeBilletCumule = "VIP_SIMPLE";

    @Column(name = "BILLETS_CUMULES", nullable = false)
    @Builder.Default
    private Integer billetsCumules = 0;

    @Column(name = "GRATUITS_ACQUIS", nullable = false)
    @Builder.Default
    private Integer gratuitsAcquis = 0;

    @Column(name = "GRATUITS_UTILISES", nullable = false)
    @Builder.Default
    private Integer gratuitsUtilises = 0;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override public String getId() { return idCompteur; }
    @Override public boolean isNew() { return isNew; }
    @PostLoad @PostPersist void markNotNew() { isNew = false; }
}
