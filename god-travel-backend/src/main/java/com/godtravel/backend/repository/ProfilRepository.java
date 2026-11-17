package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfilRepository extends JpaRepository<Profil, String> {
    Optional<Profil> findByCodeProfil(String codeProfil);
}

