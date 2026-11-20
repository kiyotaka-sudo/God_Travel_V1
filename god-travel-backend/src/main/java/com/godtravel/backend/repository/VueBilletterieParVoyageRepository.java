package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueBilletterieParVoyage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VueBilletterieParVoyageRepository extends JpaRepository<VueBilletterieParVoyage, String> {
    List<VueBilletterieParVoyage> findAllByOrderByDateHeureDepartPrevueDesc();
}
