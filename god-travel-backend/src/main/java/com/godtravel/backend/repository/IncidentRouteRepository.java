package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.IncidentRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IncidentRouteRepository extends JpaRepository<IncidentRoute, String> {
    List<IncidentRoute> findByVoyage_IdVoyage(String idVoyage);
    List<IncidentRoute> findByVoyage_IdVoyageOrderByDateHeureIncidentDesc(String idVoyage);
    List<IncidentRoute> findByDateHeureIncidentGreaterThanEqualAndDateHeureIncidentLessThanOrderByDateHeureIncidentDesc(LocalDateTime debut, LocalDateTime fin);
}
