package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "TYPE_DOCUMENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypeDocument implements Persistable<String> {
    @Id
    @Column(name = "ID_TYPE_DOC", length = 20, nullable = false)
    private String idTypeDoc;

    @Column(name = "CODE_TYPE", length = 30, nullable = false, unique = true)
    private String codeType;

    @Column(name = "LIBELLE_TYPE", length = 100, nullable = false)
    private String libelleType;

    @Transient @Builder.Default private boolean isNew = true;
    @Override public String getId() { return idTypeDoc; }
    @Override public boolean isNew() { return isNew; }
    @PostLoad @PostPersist void markNotNew() { isNew = false; }
}
