package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.LocalDate;

@Entity
@Table(name = "CLIENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Client implements Persistable<String> {

    @Id
    @Column(name = "ID_CLIENT", length = 20, nullable = false)
    private String idClient;

    @Column(name = "NOM", length = 50, nullable = false)
    private String nom;

    @Column(name = "PRENOM", length = 50)
    private String prenom;

    @Column(name = "AUTRES_PRENOMS", length = 50)
    private String autresPrenoms;

    @Column(name = "NUMERO_CNI", length = 30)
    private String numeroCni;

    @Column(name = "DATE_EXPIRATION_CNI")
    private LocalDate dateExpirationCni;

    @Column(name = "DATE_NAISSANCE")
    private LocalDate dateNaissance;

    @Column(name = "SEXE", columnDefinition = "CHAR(1)")
    private String sexe;

    @Column(name = "TELEPHONE", length = 20, nullable = false)
    private String telephone;

    @Column(name = "EMAIL", length = 120)
    private String email;

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

