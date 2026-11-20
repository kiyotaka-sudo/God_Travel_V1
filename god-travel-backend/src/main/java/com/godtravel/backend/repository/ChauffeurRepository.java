package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Chauffeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChauffeurRepository extends JpaRepository<Chauffeur, String> {
    Optional<Chauffeur> findByEmploye_IdEmploye(String idEmploye);
}
