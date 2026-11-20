package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.PackClient;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PackClientRepository extends JpaRepository<PackClient, String> {
    List<PackClient> findByClient_IdClientOrderByDateAchatDesc(String idClient);
    Optional<PackClient> findByIdPackClientAndClient_IdClient(String idPackClient, String idClient);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pc from PackClient pc where pc.idPackClient = :id")
    Optional<PackClient> findForUpdate(@Param("id") String idPackClient);
}
