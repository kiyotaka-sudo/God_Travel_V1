package com.godtravel.backend.repository;

import com.godtravel.backend.model.entity.view.VueFideliteClient;
import com.godtravel.backend.model.entity.view.VueFideliteClientId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VueFideliteClientRepository extends JpaRepository<VueFideliteClient, VueFideliteClientId> {
    List<VueFideliteClient> findTop10ByOrderBySoldeGratuitsCalculeDesc();
}
