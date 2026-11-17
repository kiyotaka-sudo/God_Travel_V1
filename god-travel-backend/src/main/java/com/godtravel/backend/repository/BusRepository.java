package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, String> {
    Optional<Bus> findByImmatriculation(String immatriculation);
    java.util.List<Bus> findAllByCompagnie_IdCompagnie(String idCompagnie);
}

