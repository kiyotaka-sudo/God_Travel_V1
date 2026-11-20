package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.CompteurFidelite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface CompteurFideliteRepository extends JpaRepository<CompteurFidelite, String> {
    Optional<CompteurFidelite> findByClient_IdClientAndTypeBilletCumule(String idClient, String typeBilletCumule);
    List<CompteurFidelite> findByClient_IdClient(String idClient);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CompteurFidelite c where c.client.idClient = :idClient and c.typeBilletCumule = :type")
    Optional<CompteurFidelite> findForUpdate(@Param("idClient") String idClient, @Param("type") String typeBilletCumule);
}
