package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, String> {
    List<Maintenance> findByEmploye_Compagnie_IdCompagnieOrderByDateMaintenanceDesc(String idCompagnie);
}
