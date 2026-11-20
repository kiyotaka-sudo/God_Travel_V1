package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.equipage.AffecterEquipageRequest;
import com.godtravel.backend.model.dto.equipage.AffecterEquipageView;
import com.godtravel.backend.model.dto.equipage.EmployeEquipageView;
import com.godtravel.backend.model.dto.equipage.VoyageEquipageView;
import com.godtravel.backend.model.entity.RoleVoyage;
import com.godtravel.backend.service.EquipageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipage")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE')")
public class EquipageController {

    private final EquipageService equipageService;

    @GetMapping("/voyage/{idVoyage}")
    public ResponseEntity<ApiResponse<List<AffecterEquipageView>>> getEquipage(@PathVariable String idVoyage) {
        return ResponseEntity.ok(ApiResponse.ok(equipageService.getEquipage(idVoyage)));
    }

    @PostMapping("/voyage/{idVoyage}")
    public ResponseEntity<ApiResponse<AffecterEquipageView>> affecter(
            @PathVariable String idVoyage,
            @Valid @RequestBody AffecterEquipageRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Membre ajouté à l’équipage.", equipageService.affecterMembre(
                idVoyage, request.idEmploye(), request.codeRole(), request.observations())));
    }

    @DeleteMapping("/voyage/{idVoyage}/{idEmploye}")
    public ResponseEntity<ApiResponse<Void>> retirer(
            @PathVariable String idVoyage,
            @PathVariable String idEmploye
    ) {
        equipageService.retirerMembre(idVoyage, idEmploye);
        return ResponseEntity.ok(ApiResponse.ok("Membre retiré de l’équipage.", null));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleVoyage>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.ok(equipageService.getRoles()));
    }

    @GetMapping("/employes")
    public ResponseEntity<ApiResponse<List<EmployeEquipageView>>> getEmployes() {
        return ResponseEntity.ok(ApiResponse.ok(equipageService.getEmployes()));
    }

    @GetMapping("/voyages")
    public ResponseEntity<ApiResponse<List<VoyageEquipageView>>> getVoyagesAffectables() {
        return ResponseEntity.ok(ApiResponse.ok(equipageService.getVoyagesAffectables()));
    }
}
