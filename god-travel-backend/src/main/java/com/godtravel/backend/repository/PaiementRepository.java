package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, String> {
    List<Paiement> findByClotureCaisse_IdCloture(String idCloture);
    Optional<Paiement> findByReferenceTransaction(String referenceTransaction);
}

