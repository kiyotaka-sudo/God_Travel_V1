package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueReleveCaisseJournalier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VueReleveCaisseJournalierRepository extends JpaRepository<VueReleveCaisseJournalier, String> {
    List<VueReleveCaisseJournalier> findByDateCloture(LocalDate dateCloture);
}

