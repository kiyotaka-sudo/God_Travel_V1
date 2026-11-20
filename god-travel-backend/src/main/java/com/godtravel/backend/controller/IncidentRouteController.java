package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.equipage.IncidentRouteRequest;
import com.godtravel.backend.model.dto.equipage.IncidentRouteView;
import com.godtravel.backend.service.IncidentRouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/incidents-route")
@RequiredArgsConstructor
public class IncidentRouteController {

    private final IncidentRouteService incidentRouteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','CHAUFFEUR')")
    public ResponseEntity<ApiResponse<IncidentRouteView>> declarer(@Valid @RequestBody IncidentRouteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Incident signalé à l’agence.", incidentRouteService.declarer(request)));
    }

    @GetMapping("/voyage/{idVoyage}")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','CHAUFFEUR')")
    public ResponseEntity<ApiResponse<List<IncidentRouteView>>> getPourVoyage(@PathVariable String idVoyage) {
        return ResponseEntity.ok(ApiResponse.ok(incidentRouteService.getIncidents(idVoyage)));
    }

    @GetMapping("/jour")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE')")
    public ResponseEntity<ApiResponse<List<IncidentRouteView>>> getIncidentsJour() {
        return ResponseEntity.ok(ApiResponse.ok(incidentRouteService.getIncidentsJour()));
    }
}
