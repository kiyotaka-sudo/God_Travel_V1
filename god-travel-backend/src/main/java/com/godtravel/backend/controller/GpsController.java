package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.gps.PointageGpsDto;
import com.godtravel.backend.model.entity.AlerteGps;
import com.godtravel.backend.model.entity.PositionGps;
import com.godtravel.backend.service.GpsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/positions-gps")
@RequiredArgsConstructor
public class GpsController {

    private final GpsService gpsService;

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<List<PositionGps>>> getLivePositions() {
        List<PositionGps> list = gpsService.getLatestPositions();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHAUFFEUR')")
    public ResponseEntity<ApiResponse<PositionGps>> enregistrerPointage(@Valid @RequestBody PointageGpsDto dto) {
        PositionGps pos = gpsService.enregistrerPosition(dto);
        return ResponseEntity.ok(ApiResponse.ok("Pointage GPS enregistré", pos));
    }

    @GetMapping("/alertes")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE')")
    public ResponseEntity<ApiResponse<List<AlerteGps>>> getAlertes() {
        List<AlerteGps> alertes = gpsService.getAlertesActives();
        return ResponseEntity.ok(ApiResponse.ok(alertes));
    }

    @PutMapping("/alertes/{id}/acquitter")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE')")
    public ResponseEntity<ApiResponse<AlerteGps>> acquitterAlerte(@PathVariable("id") String idAlerte) {
        AlerteGps alerte = gpsService.acquitterAlerte(idAlerte);
        return ResponseEntity.ok(ApiResponse.ok("Alerte acquittée", alerte));
    }
}

