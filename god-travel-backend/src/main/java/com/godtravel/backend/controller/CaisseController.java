package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.caisse.CaisseTransactionView;
import com.godtravel.backend.model.entity.ClotureCaisse;
import com.godtravel.backend.model.entity.view.VueReleveCaisseJournalier;
import com.godtravel.backend.service.CaisseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/sessions-caisse")
@RequiredArgsConstructor
public class CaisseController {

    private final CaisseService caisseService;

    @GetMapping("/releves")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<List<VueReleveCaisseJournalier>>> getReleves() {
        List<VueReleveCaisseJournalier> releves = caisseService.getRelevesJournaliers();
        return ResponseEntity.ok(ApiResponse.ok(releves));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSessionActive() {
        ClotureCaisse session = caisseService.getSessionActiveAgent();
        if (session == null) return ResponseEntity.ok(ApiResponse.ok("Aucune session ouverte", null));
        Map<String, Object> data = new HashMap<>();
        data.put("idCloture", session.getIdCloture());
        data.put("nomAgence", session.getAgence().getNomAgence());
        data.put("dateCloture", session.getDateCloture());
        data.put("heureOuverture", session.getHeureOuverture());
        data.put("heureFermeture", session.getHeureFermeture());
        data.put("montantTheoriqueXaf", caisseService.getTotalSession(session.getIdCloture()));
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/{id}/paiements")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<List<CaisseTransactionView>>> getPaiements(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(caisseService.getTransactionsSession(id)));
    }

    @PostMapping("/ouvrir")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER')")
    public ResponseEntity<ApiResponse<ClotureCaisse>> ouvrirCaisse() {
        ClotureCaisse session = caisseService.ouvrirCaisse();
        return ResponseEntity.ok(ApiResponse.ok("Session de caisse ouverte", session));
    }

    @PutMapping("/{id}/fermer")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER')")
    public ResponseEntity<ApiResponse<ClotureCaisse>> fermerCaisse(
            @PathVariable("id") String idCloture,
            @RequestBody Map<String, Object> body
    ) {
        BigDecimal montantPhysique = body.get("montantPhysique") != null 
                ? new BigDecimal(body.get("montantPhysique").toString()) 
                : null;
        String observations = (String) body.getOrDefault("observations", "");

        ClotureCaisse session = caisseService.cloturerCaisse(idCloture, montantPhysique, observations);
        return ResponseEntity.ok(ApiResponse.ok("Session de caisse clôturée", session));
    }
}

