package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.ClotureCaisse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClotureCaisseRepository extends JpaRepository<ClotureCaisse, String> {
    List<ClotureCaisse> findByAgence_IdAgence(String idAgence);
    Optional<ClotureCaisse> findByAgence_IdAgenceAndDateClotureAndHeureFermetureIsNull(String idAgence, LocalDate dateCloture);
}

