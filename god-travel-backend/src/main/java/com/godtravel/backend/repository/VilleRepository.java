package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Ville;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VilleRepository extends JpaRepository<Ville, String> {
    Optional<Ville> findByNomVille(String nomVille);
}

