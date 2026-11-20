package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.AffecterEquipage;
import com.godtravel.backend.model.entity.AffecterEquipageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AffecterEquipageRepository extends JpaRepository<AffecterEquipage, AffecterEquipageId> {
    List<AffecterEquipage> findByVoyage_IdVoyage(String idVoyage);

    boolean existsByVoyage_IdVoyageAndEmploye_IdEmploye(String idVoyage, String idEmploye);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM AffecterEquipage a " +
            "WHERE a.voyage.idVoyage = :idVoyage AND a.employe.idEmploye = :idEmploye " +
            "AND a.roleVoyage.codeRole IN ('CHAUFFEUR_PRINCIPAL', 'CHAUFFEUR_RELAIS')")
    boolean estChauffeurAffecte(@Param("idVoyage") String idVoyage, @Param("idEmploye") String idEmploye);

    @Query("SELECT a FROM AffecterEquipage a " +
            "JOIN FETCH a.voyage v " +
            "JOIN FETCH v.bus b " +
            "JOIN FETCH b.classeBus " +
            "JOIN FETCH v.ligne l " +
            "JOIN FETCH l.villeDepart " +
            "JOIN FETCH l.villeArrivee " +
            "JOIN FETCH a.roleVoyage r " +
            "WHERE a.employe.idEmploye = :idEmploye " +
            "AND v.dateHeureDepartPrevue >= :debut AND v.dateHeureDepartPrevue < :fin " +
            "AND r.codeRole IN ('CHAUFFEUR_PRINCIPAL', 'CHAUFFEUR_RELAIS') " +
            "ORDER BY v.dateHeureDepartPrevue ASC")
    List<AffecterEquipage> findTrajetsChauffeurDuJour(
            @Param("idEmploye") String idEmploye,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );
}
