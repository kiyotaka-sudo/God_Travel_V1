package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Client c where c.idClient = :idClient")
    Optional<Client> findForFidelityUpdate(@Param("idClient") String idClient);
    Optional<Client> findByTelephone(String telephone);
    Optional<Client> findByNumeroCni(String numeroCni);
    Optional<Client> findByEmailIgnoreCase(String email);

    @Query(value = "SELECT * FROM CLIENT WHERE RIGHT(REGEXP_REPLACE(TELEPHONE, '[^0-9]', ''), 9) = :telephoneDigits", nativeQuery = true)
    List<Client> findByTelephoneDigits(@Param("telephoneDigits") String telephoneDigits);
}

