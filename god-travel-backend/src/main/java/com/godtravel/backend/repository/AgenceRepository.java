package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Agence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgenceRepository extends JpaRepository<Agence, String> {
    Optional<Agence> findByCodeAgence(String codeAgence);
    List<Agence> findByCompagnie_IdCompagnie(String idCompagnie);
}

