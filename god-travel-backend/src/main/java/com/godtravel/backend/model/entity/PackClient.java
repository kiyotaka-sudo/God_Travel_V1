package com.godtravel.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PACK_CLIENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackClient implements Persistable<String> {
    @Id
    @Column(name = "ID_PACK_CLIENT", length = 20, nullable = false)
    private String idPackClient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PACK", nullable = false)
    private Pack pack;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENT", nullable = false)
    private Client client;

    @Column(name = "DATE_ACHAT", nullable = false)
    private LocalDateTime dateAchat;

    @Column(name = "DATE_EXPIRATION", nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "VOYAGES_RESTANTS", nullable = false)
    private Integer voyagesRestants;

    @Column(name = "EST_EPUISE", nullable = false)
    @Builder.Default
    private Boolean estEpuise = false;

    @Transient @Builder.Default private boolean isNew = true;
    @Override public String getId() { return idPackClient; }
    @Override public boolean isNew() { return isNew; }
    @PostLoad @PostPersist void markNotNew() { isNew = false; }
}
