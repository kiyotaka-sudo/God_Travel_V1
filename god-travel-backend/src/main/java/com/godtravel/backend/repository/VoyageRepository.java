package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Voyage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoyageRepository extends JpaRepository<Voyage, String> {
    Optional<Voyage> findByCodeVoyage(String codeVoyage);
    List<Voyage> findByStatutVoyage(String statutVoyage);
    List<Voyage> findByAgence_IdAgence(String idAgence);

    @Query("SELECT v FROM Voyage v WHERE v.ligne.idLigne = :idLigne AND v.dateHeureDepartPrevue >= :dateDebut AND v.statutVoyage IN ('PROGRAMME', 'OUVERT', 'CONFIRME') ORDER BY v.dateHeureDepartPrevue ASC")
    List<Voyage> findVoyagesDisponibles(@Param("idLigne") String idLigne, @Param("dateDebut") LocalDateTime dateDebut);
}

