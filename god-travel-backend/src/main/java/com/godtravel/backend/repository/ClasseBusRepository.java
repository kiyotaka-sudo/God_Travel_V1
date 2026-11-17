package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.ClasseBus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClasseBusRepository extends JpaRepository<ClasseBus, String> {
    Optional<ClasseBus> findByCodeClasse(String codeClasse);
}

