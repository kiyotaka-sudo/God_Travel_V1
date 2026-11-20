package com.godtravel.backend.service;

import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.gps.PointageGpsDto;
import com.godtravel.backend.model.entity.AlerteGps;
import com.godtravel.backend.model.entity.PositionGps;
import com.godtravel.backend.model.entity.Voyage;
import com.godtravel.backend.repository.AlerteGpsRepository;
import com.godtravel.backend.repository.PositionGpsRepository;
import com.godtravel.backend.repository.VoyageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GpsService {

    private final PositionGpsRepository positionGpsRepository;
    private final AlerteGpsRepository alerteGpsRepository;
    private final VoyageRepository voyageRepository;

    public List<PositionGps> getLatestPositions() {
        return positionGpsRepository.findLatestPositionsSince(LocalDateTime.now().minusMinutes(5));
    }

    public List<AlerteGps> getAlertesActives() {
        return alerteGpsRepository.findByEstAcquitteeFalseOrderByDateHeureAlerteDesc();
    }

    @Transactional
    public PositionGps enregistrerPosition(PointageGpsDto dto) {
        Voyage voyage = voyageRepository.findById(dto.getIdVoyage())
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", dto.getIdVoyage()));

        String idPos = "POS-" + System.currentTimeMillis();
        PositionGps pos = PositionGps.builder()
                .idPosition(idPos)
                .idBalise(dto.getIdBalise())
                .voyage(voyage)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .vitesseKmh(dto.getVitesseKmh())
                .dateHeureReleve(LocalDateTime.now())
                .build();

        PositionGps saved = positionGpsRepository.save(pos);

        // Détection automatique de survitesse (> 100 km/h)
        if (dto.getVitesseKmh() != null && dto.getVitesseKmh() > 100) {
            String idAlerte = "ALT-" + System.currentTimeMillis();
            AlerteGps alerte = AlerteGps.builder()
                    .idAlerteGps(idAlerte)
                    .voyage(voyage)
                    .typeAlerte("EXCES_VITESSE")
                    .dateHeureAlerte(LocalDateTime.now())
                    .messageAlerte("Excès de vitesse détecté : " + dto.getVitesseKmh() + " km/h sur le voyage " + voyage.getCodeVoyage())
                    .estAcquittee(false)
                    .build();
            alerteGpsRepository.save(alerte);
        }

        return saved;
    }

    @Transactional
    public AlerteGps acquitterAlerte(String idAlerte) {
        AlerteGps alerte = alerteGpsRepository.findById(idAlerte)
                .orElseThrow(() -> new ResourceNotFoundException("AlerteGps", "id", idAlerte));
        alerte.setEstAcquittee(true);
        return alerteGpsRepository.save(alerte);
    }
}

