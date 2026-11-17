package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Colis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColisRepository extends JpaRepository<Colis, String> {
    Optional<Colis> findByCodeSuivi(String codeSuivi);
    List<Colis> findByStatutColis(String statutColis);
    List<Colis> findByAgenceDepot_IdAgence(String idAgenceDepot);
    List<Colis> findByAgenceRetrait_IdAgence(String idAgenceRetrait);
}

