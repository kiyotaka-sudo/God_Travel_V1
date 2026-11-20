package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.VerrouSiege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerrouSiegeRepository extends JpaRepository<VerrouSiege, String> {

    Optional<VerrouSiege> findByVoyage_IdVoyageAndNumSiege(String idVoyage, int numSiege);

    List<VerrouSiege> findByVoyage_IdVoyageAndDateExpirationVerrouAfter(String idVoyage, LocalDateTime now);

    @Modifying
    @Query("DELETE FROM VerrouSiege v WHERE v.dateExpirationVerrou < :now")
    void deleteExpired(@Param("now") LocalDateTime now);
}
