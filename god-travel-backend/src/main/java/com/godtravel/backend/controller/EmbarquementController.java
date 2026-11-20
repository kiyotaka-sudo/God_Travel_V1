package com.godtravel.backend.controller;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.embarquement.ValiderEmbarquementRequest;
import com.godtravel.backend.model.entity.Embarquement;
import com.godtravel.backend.model.entity.Utilisateur;
import com.godtravel.backend.model.entity.view.VueEmbarquementPassagers;
import com.godtravel.backend.repository.UtilisateurRepository;
import com.godtravel.backend.security.CustomUserDetails;
import com.godtravel.backend.service.EmbarquementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/embarquement")
@RequiredArgsConstructor
public class EmbarquementController {

    private final EmbarquementService embarquementService;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/voyage/{idVoyage}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'HOTESSE')")
    public ResponseEntity<ApiResponse<List<VueEmbarquementPassagers>>> getManifeste(
            @PathVariable String idVoyage
    ) {
        return ResponseEntity.ok(ApiResponse.ok(embarquementService.getManifeste(idVoyage)));
    }

    @PostMapping("/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'HOTESSE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validerEmbarquement(
            @Valid @RequestBody ValiderEmbarquementRequest request
    ) {
        String idEmploye = getCurrentEmployeeId();
        Embarquement embarquement = embarquementService.validerEmbarquement(
                request.codeBillet(), idEmploye, request.terminalScan());

        boolean conforme = Boolean.TRUE.equals(embarquement.getEstConforme());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("idEmbarquement", embarquement.getIdEmbarquement());
        result.put("codeBillet", request.codeBillet().trim());
        result.put("estConforme", conforme);
        result.put("dateHeureScan", embarquement.getDateHeureScan());
        result.put("terminalScan", embarquement.getTerminalScan());

        String message = conforme
                ? "Embarquement validé."
                : "Attention : signature du billet non conforme. L’embarquement est refusé.";
        return ResponseEntity.ok(ApiResponse.ok(message, result));
    }

    private String getCurrentEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            throw new BusinessException("Employé connecté introuvable.");
        }

        // CustomUserDetails.id correspond à UTILISATEUR.ID_UTILISATEUR, pas à EMPLOYE.ID_EMPLOYE.
        Utilisateur utilisateur = utilisateurRepository.findById(details.getId())
                .orElseThrow(() -> new BusinessException("Compte utilisateur introuvable."));
        if (utilisateur.getEmploye() == null) {
            throw new BusinessException("Aucun employé n’est rattaché à ce compte.");
        }
        return utilisateur.getEmploye().getIdEmploye();
    }
}
