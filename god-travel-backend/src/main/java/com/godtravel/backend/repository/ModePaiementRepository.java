package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.ModePaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModePaiementRepository extends JpaRepository<ModePaiement, String> {
    Optional<ModePaiement> findByCodeMode(String codeMode);
}

