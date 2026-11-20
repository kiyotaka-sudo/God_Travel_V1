package com.godtravel.backend.controller;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.fidelite.CompteurFideliteView;
import com.godtravel.backend.security.CustomUserDetails;
import com.godtravel.backend.service.FideliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fidelite")
@RequiredArgsConstructor
public class FideliteController {
    private final FideliteService fideliteService;

    @GetMapping("/mon-compteur")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<CompteurFideliteView>> monCompteur() {
        return ResponseEntity.ok(ApiResponse.ok(fideliteService.getCompteurClient(clientConnecte())));
    }

    @GetMapping("/client/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','GUICHETIER')")
    public ResponseEntity<ApiResponse<CompteurFideliteView>> compteurClient(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(fideliteService.getCompteurClient(id)));
    }

    private String clientConnecte() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details) return details.getId();
        throw new BusinessException("Impossible d’identifier le compte client connecté.");
    }
}
