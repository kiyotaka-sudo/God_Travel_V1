package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.Promotion;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    Optional<Promotion> findByCodePromoIgnoreCase(String codePromo);
    List<Promotion> findAllByOrderByDateDebutDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Promotion p where upper(p.codePromo) = upper(:code)")
    Optional<Promotion> findByCodeForUpdate(@Param("code") String codePromo);
}
