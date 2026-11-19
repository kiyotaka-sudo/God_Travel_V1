package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.admin.CreerUtilisateurRequest;
import com.godtravel.backend.model.dto.admin.UtilisateurAdminView;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER', 'COMPTABLE', 'MECANICIEN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/compagnies")
    public ResponseEntity<ApiResponse<List<Compagnie>>> getCompagnies() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getCompagnies()));
    }

    @GetMapping("/agences")
    public ResponseEntity<ApiResponse<List<Agence>>> getAgences() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAgences()));
    }

    @GetMapping("/villes")
    public ResponseEntity<ApiResponse<List<Ville>>> getVilles() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getVilles()));
    }

    @GetMapping("/lignes")
    public ResponseEntity<ApiResponse<List<Ligne>>> getLignes() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getLignes()));
    }

    @GetMapping("/bus")
    public ResponseEntity<ApiResponse<List<Bus>>> getBus() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getBus()));
    }

    @GetMapping("/utilisateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UtilisateurAdminView>>> getUtilisateurs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUtilisateurs()));
    }

    @GetMapping("/profils")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Profil>>> getProfils() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getProfils()));
    }

    @PostMapping("/utilisateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UtilisateurAdminView>> creerUtilisateur(@Valid @RequestBody CreerUtilisateurRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Compte créé et rattaché à un rôle", adminService.creerUtilisateur(request)));
    }
}

