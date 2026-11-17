package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueVoyagesDisponibles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VueVoyagesDisponiblesRepository extends JpaRepository<VueVoyagesDisponibles, String> {
    List<VueVoyagesDisponibles> findByVilleDepartAndVilleArrivee(String villeDepart, String villeArrivee);
    List<VueVoyagesDisponibles> findByStatutVoyage(String statutVoyage);
}

