package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueStatistiquesJournalieres;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VueStatistiquesJournalieresRepository extends JpaRepository<VueStatistiquesJournalieres, String> {
    List<VueStatistiquesJournalieres> findAllByOrderByDateJourDesc();
}
