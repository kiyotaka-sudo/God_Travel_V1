package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Bagage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BagageRepository extends JpaRepository<Bagage, String> {
    List<Bagage> findByBillet_IdBillet(String idBillet);
    boolean existsByBillet_IdBillet(String idBillet);
    boolean existsByNumeroEtiquette(String numeroEtiquette);
}
