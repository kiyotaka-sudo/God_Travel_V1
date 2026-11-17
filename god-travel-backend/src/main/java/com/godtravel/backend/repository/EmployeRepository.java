package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, String> {
    Optional<Employe> findByMatricule(String matricule);
    Optional<Employe> findByNumeroCni(String numeroCni);
}

