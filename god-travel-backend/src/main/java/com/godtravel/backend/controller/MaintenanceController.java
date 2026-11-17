package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.maintenance.BusMaintenanceView;
import com.godtravel.backend.model.dto.maintenance.MaintenanceRequest;
import com.godtravel.backend.model.dto.maintenance.MaintenanceView;
import com.godtravel.backend.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MECANICIEN')")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaintenanceView>>> getInterventions() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getInterventions()));
    }

    @GetMapping("/bus")
    public ResponseEntity<ApiResponse<List<BusMaintenanceView>>> getBus() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getBus()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceView>> creer(@Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Intervention enregistrée", maintenanceService.creer(request)));
    }
}
