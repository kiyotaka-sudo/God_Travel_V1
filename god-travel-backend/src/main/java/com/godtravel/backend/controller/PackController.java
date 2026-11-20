package com.godtravel.backend.controller;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.packs.PackClientView;
import com.godtravel.backend.model.dto.packs.PackSouscriptionRequest;
import com.godtravel.backend.model.dto.packs.PackView;
import com.godtravel.backend.security.CustomUserDetails;
import com.godtravel.backend.service.PackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packs")
@RequiredArgsConstructor
public class PackController {
    private final PackService packService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<PackView>>> getPacks() {
        return ResponseEntity.ok(ApiResponse.ok(packService.getPacksDisponibles()));
    }

    @PostMapping("/souscrire")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN','GUICHETIER')")
    public ResponseEntity<ApiResponse<PackClientView>> souscrire(@Valid @RequestBody PackSouscriptionRequest request) {
        String clientId = request.idClient();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> "ROLE_CLIENT".equals(a.getAuthority()))) {
            clientId = clientConnecte();
        } else if (clientId == null || clientId.isBlank()) {
            throw new BusinessException("Un client doit être sélectionné pour souscrire ce pack.");
        }
        return ResponseEntity.ok(ApiResponse.ok("Souscription au pack enregistrée.", packService.souscrire(clientId, request.idPack())));
    }

    @GetMapping("/mes-packs")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<PackClientView>>> mesPacks() {
        return ResponseEntity.ok(ApiResponse.ok(packService.getPacksClient(clientConnecte())));
    }

    private String clientConnecte() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details) return details.getId();
        throw new BusinessException("Impossible d’identifier le compte client connecté.");
    }
}
