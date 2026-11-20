package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Embarquement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmbarquementRepository extends JpaRepository<Embarquement, String> {
    Optional<Embarquement> findByBillet_IdBillet(String idBillet);

    boolean existsByBillet_IdBillet(String idBillet);
}
