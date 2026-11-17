package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {
    Optional<Client> findByTelephone(String telephone);
    Optional<Client> findByNumeroCni(String numeroCni);
}

