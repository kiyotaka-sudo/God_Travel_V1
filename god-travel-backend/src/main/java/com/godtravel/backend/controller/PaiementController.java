package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.paiement.MonetbilInitRequest;
import com.godtravel.backend.model.dto.paiement.MonetbilInitResponse;
import com.godtravel.backend.model.dto.paiement.MonetbilStatusView;
import com.godtravel.backend.service.MonetbilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/paiements")
@RequiredArgsConstructor
@Slf4j
public class PaiementController {

    private final MonetbilService monetbilService;

    /**
     * Initialise une transaction Mobile Money / Orange Money via Monetbil
     */
    @PostMapping("/monetbil/initier")
    public ResponseEntity<ApiResponse<MonetbilInitResponse>> initierMonetbil(
            @Valid @RequestBody MonetbilInitRequest request
    ) {
        MonetbilInitResponse response = monetbilService.initierPaiement(request);
        return ResponseEntity.ok(ApiResponse.ok("Session de paiement Monetbil prête", response));
    }

    /**
     * Webhook IPN appelé automatiquement par les serveurs Monetbil
     * (URL publique notifiée par Monetbil après validation USSD sur le téléphone)
     */
    @RequestMapping(path = "/monetbil/notify", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<String> webhookMonetbil(@RequestParam Map<String, String> payload) {
        log.info("Notification IPN Monetbil reçue");
        boolean ok = monetbilService.traiterWebhook(payload);
        if (ok) {
            return ResponseEntity.ok("SUCCESS");
        }
        return ResponseEntity.badRequest().body("FAILED");
    }

    @GetMapping("/monetbil/statut")
    public ResponseEntity<ApiResponse<MonetbilStatusView>> getStatut(
            @RequestParam String reference,
            @RequestParam String telephone
    ) {
        return ResponseEntity.ok(ApiResponse.ok(monetbilService.getStatut(reference, telephone)));
    }
}

