package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.equipage.FeuilleRouteChauffeurView;
import com.godtravel.backend.service.ChauffeurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chauffeur")
@RequiredArgsConstructor
public class ChauffeurController {

    private final ChauffeurService chauffeurService;

    @GetMapping("/mon-trajet")
    @PreAuthorize("hasRole('CHAUFFEUR')")
    public ResponseEntity<ApiResponse<FeuilleRouteChauffeurView>> getMonTrajet() {
        return ResponseEntity.ok(ApiResponse.ok(chauffeurService.getMonTrajet()));
    }
}
