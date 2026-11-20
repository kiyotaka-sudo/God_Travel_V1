package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueEmbarquementPassagers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VueEmbarquementPassagersRepository extends JpaRepository<VueEmbarquementPassagers, String> {
    List<VueEmbarquementPassagers> findByIdVoyage(String idVoyage);
}
