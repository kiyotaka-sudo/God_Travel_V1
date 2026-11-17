package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.CategorieVoyageur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategorieVoyageurRepository extends JpaRepository<CategorieVoyageur, String> {
    Optional<CategorieVoyageur> findByCodeCategorie(String codeCategorie);
}

