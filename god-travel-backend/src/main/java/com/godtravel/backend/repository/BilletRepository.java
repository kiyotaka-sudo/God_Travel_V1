package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Billet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface BilletRepository extends JpaRepository<Billet, String> {
    Optional<Billet> findByCodeBillet(String codeBillet);
    Optional<Billet> findByCodeReservation(String codeReservation);
    List<Billet> findByVoyage_IdVoyage(String idVoyage);
    List<Billet> findByClient_IdClientOrderByDateEmissionDesc(String idClient);

    @Query("SELECT b.numSiege FROM Billet b WHERE b.voyage.idVoyage = :idVoyage AND (b.statutBillet IN ('VALIDE', 'EMBARQUE') OR (b.statutBillet = 'EN_ATTENTE_PAIEMENT' AND b.dateEmission >= :since))")
    List<Integer> findSiegesOccupesByVoyage(@Param("idVoyage") String idVoyage, @Param("since") LocalDateTime since);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Billet b WHERE b.voyage.idVoyage = :idVoyage AND b.numSiege = :numSiege AND (b.statutBillet IN ('VALIDE', 'EMBARQUE') OR (b.statutBillet = 'EN_ATTENTE_PAIEMENT' AND b.dateEmission >= :since))")
    boolean existsSiegeOccupe(@Param("idVoyage") String idVoyage, @Param("numSiege") Integer numSiege, @Param("since") LocalDateTime since);

    boolean existsByVoyage_IdVoyageAndNumSiegeAndStatutBilletIn(String idVoyage, Integer numSiege, List<String> statuts);
}

