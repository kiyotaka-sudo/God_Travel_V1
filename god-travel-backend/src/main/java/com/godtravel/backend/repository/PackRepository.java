package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Pack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackRepository extends JpaRepository<Pack, String> {
    List<Pack> findByEstActifTrueOrderByPrixPackXafAsc();
}
