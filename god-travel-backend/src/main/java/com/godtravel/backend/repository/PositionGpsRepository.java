package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.PositionGps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionGpsRepository extends JpaRepository<PositionGps, String> {
    List<PositionGps> findByVoyage_IdVoyageOrderByDateHeureReleveDesc(String idVoyage);

    @Query("SELECT p FROM PositionGps p WHERE p.dateHeureReleve = (SELECT MAX(p2.dateHeureReleve) FROM PositionGps p2 WHERE p2.voyage.idVoyage = p.voyage.idVoyage)")
    List<PositionGps> findLatestPositions();
}

