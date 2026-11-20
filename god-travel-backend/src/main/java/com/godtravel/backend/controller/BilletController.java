package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.billetterie.ReservationRequest;
import com.godtravel.backend.model.dto.billetterie.BilletReservationView;
import com.godtravel.backend.model.dto.billetterie.TicketPublicView;
import com.godtravel.backend.model.entity.Billet;
import com.godtravel.backend.service.BilletterieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/billets")
@RequiredArgsConstructor
public class BilletController {

    private final BilletterieService billetterieService;

    @GetMapping("/consulter")
    public ResponseEntity<ApiResponse<TicketPublicView>> consulterBillet(
            @RequestParam String codeBillet,
            @RequestParam String telephone
    ) {
        return ResponseEntity.ok(ApiResponse.ok(billetterieService.consulterBillet(codeBillet, telephone)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE', 'GUICHETIER')")
    public ResponseEntity<ApiResponse<BilletReservationView>> reserverBillet(@Valid @RequestBody ReservationRequest request) {
        Billet billet = billetterieService.reserverBillet(request);
        return ResponseEntity.ok(ApiResponse.ok("Réservation enregistrée", reservationView(billet)));
    }

    @PostMapping("/client")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<BilletReservationView>> reserverEnLigne(@Valid @RequestBody ReservationRequest request) {
        Billet billet = billetterieService.reserverBillet(request);
        return ResponseEntity.ok(ApiResponse.ok("Réservation créée. Le siège sera confirmé après paiement.", reservationView(billet)));
    }

    @GetMapping("/mes-billets")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<java.util.List<TicketPublicView>>> mesBillets() {
        return ResponseEntity.ok(ApiResponse.ok(billetterieService.getBilletsClientConnecte()));
    }

    private BilletReservationView reservationView(Billet billet) {
        return BilletReservationView.builder()
                .idBillet(billet.getIdBillet())
                .codeBillet(billet.getCodeBillet())
                .codeReservation(billet.getCodeReservation())
                .statutBillet(billet.getStatutBillet())
                .telephoneClient(billet.getClient().getTelephone())
                .numeroSiege(billet.getNumSiege())
                .montantXaf(billet.getPrixAppliqueXaf())
                .build();
    }

    @PutMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_AGENCE')")
    public ResponseEntity<ApiResponse<Billet>> annulerBillet(@PathVariable("id") String idBillet) {
        Billet billet = billetterieService.annulerBillet(idBillet);
        return ResponseEntity.ok(ApiResponse.ok("Billet annulé avec succès", billet));
    }

    @GetMapping("/{code}/qr")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getQrCode(@PathVariable("code") String codeBillet) {
        byte[] qrImage = billetterieService.genererQrCode(codeBillet);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"qr-" + codeBillet + ".png\"")
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }
}

