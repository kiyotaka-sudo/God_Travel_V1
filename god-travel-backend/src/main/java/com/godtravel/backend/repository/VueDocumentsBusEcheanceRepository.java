package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueDocumentsBusEcheance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface VueDocumentsBusEcheanceRepository extends JpaRepository<VueDocumentsBusEcheance, String> {
    List<VueDocumentsBusEcheance> findByEtatEcheanceInOrderByJoursAvantExpirationAsc(Collection<String> etats);
}
