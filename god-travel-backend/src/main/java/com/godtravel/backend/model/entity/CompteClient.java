package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.LocalDateTime;

@Entity
@Table(name = "COMPTE_CLIENT", uniqueConstraints = @UniqueConstraint(name = "uk_compte_client_email", columnNames = "EMAIL"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompteClient implements Persistable<String> {

    @Id
    @Column(name = "ID_CLIENT", length = 20, nullable = false)
    private String idClient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENT", insertable = false, updatable = false)
    private Client client;

    @Column(name = "EMAIL", length = 120, nullable = false)
    private String email;

    @Column(name = "MOT_DE_PASSE_HASH", length = 255, nullable = false)
    private String motDePasseHash;

    @Column(name = "EST_ACTIF", nullable = false)
    @Builder.Default
    private Boolean estActif = true;

    @Column(name = "DATE_CREATION", nullable = false)
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public String getId() {
        return idClient;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
