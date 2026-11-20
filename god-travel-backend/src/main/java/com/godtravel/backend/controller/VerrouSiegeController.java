package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.billetterie.VerrouSiegeRequest;
import com.godtravel.backend.model.dto.billetterie.VerrouSiegeResponse;
import com.godtravel.backend.service.VerrouSiegeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/voyages")
@RequiredArgsConstructor
public class VerrouSiegeController {

    private final VerrouSiegeService verrouSiegeService;

    @PostMapping("/{idVoyage}/verrouiller-siege")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','GUICHETIER','CLIENT')")
    public ResponseEntity<ApiResponse<VerrouSiegeResponse>> verrouiller(
            @PathVariable String idVoyage,
            @Valid @RequestBody VerrouSiegeRequest request
    ) {
        VerrouSiegeResponse response = verrouSiegeService.verrouiller(idVoyage, request.numSiege());
        return ResponseEntity.ok(ApiResponse.ok("Siège réservé pour 15 minutes.", response));
    }

    @DeleteMapping("/{idVoyage}/liberer-siege")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','GUICHETIER','CLIENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> liberer(
            @PathVariable String idVoyage,
            @RequestParam int numSiege
    ) {
        verrouSiegeService.liberer(idVoyage, numSiege);
        return ResponseEntity.ok(ApiResponse.ok("Verrou libéré.", Map.of("idVoyage", idVoyage, "numSiege", numSiege)));
    }
}
