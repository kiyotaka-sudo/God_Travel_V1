package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "ROLE_VOYAGE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleVoyage implements Persistable<String> {

    @Id
    @Column(name = "ID_ROLE_VOYAGE", length = 20, nullable = false)
    private String idRoleVoyage;

    @Column(name = "CODE_ROLE", length = 30, nullable = false, unique = true)
    private String codeRole;

    @Column(name = "LIBELLE_ROLE", length = 50, nullable = false)
    private String libelleRole;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public String getId() {
        return idRoleVoyage;
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
