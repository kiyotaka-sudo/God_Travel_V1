package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.LocalDate;

@Entity
@Table(name = "DOCUMENT_BUS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentBus implements Persistable<String> {
    @Id
    @Column(name = "ID_DOCUMENT", length = 20, nullable = false)
    private String idDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BUS", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TYPE_DOC", nullable = false)
    private TypeDocument typeDocument;

    @Column(name = "NUMERO_PIECE", length = 50, nullable = false)
    private String numeroPiece;

    @Column(name = "DATE_EMISSION", nullable = false)
    private LocalDate dateEmission;

    @Column(name = "DATE_EXPIRATION", nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "FICHIER_SCAN", length = 255)
    private String fichierScan;

    @Column(name = "EST_VALIDE", nullable = false)
    @Builder.Default
    private Boolean estValide = true;

    @Transient @Builder.Default private boolean isNew = true;
    @Override public String getId() { return idDocument; }
    @Override public boolean isNew() { return isNew; }
    @PostLoad @PostPersist void markNotNew() { isNew = false; }
}
