package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.AlerteGps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlerteGpsRepository extends JpaRepository<AlerteGps, String> {
    List<AlerteGps> findByEstAcquitteeFalseOrderByDateHeureAlerteDesc();
}

