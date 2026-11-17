package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Compagnie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompagnieRepository extends JpaRepository<Compagnie, String> {
    Optional<Compagnie> findBySigle(String sigle);
}

