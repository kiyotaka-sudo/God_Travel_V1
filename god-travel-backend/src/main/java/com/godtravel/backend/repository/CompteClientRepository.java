package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.CompteClient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompteClientRepository extends JpaRepository<CompteClient, String> {
    Optional<CompteClient> findByEmailIgnoreCase(String email);
}
