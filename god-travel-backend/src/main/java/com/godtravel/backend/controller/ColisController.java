package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.colis.ColisCreationRequest;
import com.godtravel.backend.model.entity.Colis;
import com.godtravel.backend.service.ColisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/colis")
@RequiredArgsConstructor
public class ColisController {

    private final ColisService colisService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Colis>>> listerColis(@RequestParam(value = "statut", required = false) String statut) {
        List<Colis> list = colisService.listerColis(statut);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/suivi/{codeSuivi}")
    public ResponseEntity<ApiResponse<Colis>> suivreColis(@PathVariable("codeSuivi") String codeSuivi) {
        Colis colis = colisService.getColisParCodeSuivi(codeSuivi);
        return ResponseEntity.ok(ApiResponse.ok(colis));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER')")
    public ResponseEntity<ApiResponse<Colis>> enregistrerColis(@Valid @RequestBody ColisCreationRequest request) {
        Colis colis = colisService.enregistrerColis(request);
        return ResponseEntity.ok(ApiResponse.ok("Colis enregistré avec succès", colis));
    }

    @PutMapping("/{id}/remise")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER')")
    public ResponseEntity<ApiResponse<Colis>> remettreColis(
            @PathVariable("id") String idColis,
            @RequestBody Map<String, String> body
    ) {
        String cni = body.getOrDefault("cniDestinataire", "VERIFIE");
        Colis colis = colisService.remettreColis(idColis, cni);
        return ResponseEntity.ok(ApiResponse.ok("Colis retiré par le destinataire", colis));
    }
}

