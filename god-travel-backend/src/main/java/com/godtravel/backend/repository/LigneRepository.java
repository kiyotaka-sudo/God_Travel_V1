package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Ligne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LigneRepository extends JpaRepository<Ligne, String> {
    Optional<Ligne> findByCodeLigne(String codeLigne);
}

