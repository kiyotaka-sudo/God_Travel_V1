package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.RoleVoyage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleVoyageRepository extends JpaRepository<RoleVoyage, String> {
    Optional<RoleVoyage> findByCodeRole(String codeRole);
}
