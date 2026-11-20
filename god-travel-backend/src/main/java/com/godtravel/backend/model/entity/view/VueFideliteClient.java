package com.godtravel.backend.model.entity.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "VW_FIDELITE_CLIENT_TYPE_BILLET")
@IdClass(VueFideliteClientId.class)
@Data
public class VueFideliteClient {
    @Id @Column(name = "ID_CLIENT") private String idClient;
    @Column(name = "CLIENT_NOM") private String clientNom;
    @Column(name = "CLIENT_PRENOM") private String clientPrenom;
    @Id @Column(name = "TYPE_BILLET_CUMULE") private String typeBilletCumule;
    @Column(name = "NB_COMPTEURS") private Long nbCompteurs;
    @Column(name = "BILLETS_CUMULES") private Long billetsCumules;
    @Column(name = "GRATUITS_ACQUIS") private Long gratuitsAcquis;
    @Column(name = "GRATUITS_UTILISES") private Long gratuitsUtilises;
    @Column(name = "SOLDE_GRATUITS_CALCULE") private Long soldeGratuitsCalcule;
}
