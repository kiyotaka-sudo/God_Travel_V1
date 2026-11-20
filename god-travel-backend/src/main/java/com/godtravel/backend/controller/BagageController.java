package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.bagage.BagageRequest;
import com.godtravel.backend.model.dto.bagage.BagageView;
import com.godtravel.backend.service.BagageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bagages")
@RequiredArgsConstructor
public class BagageController {

    private final BagageService bagageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','GUICHETIER')")
    public ResponseEntity<ApiResponse<BagageView>> enregistrer(@Valid @RequestBody BagageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Bagage enregistré.", bagageService.enregistrerBagage(request)));
    }

    @GetMapping("/billet/{idBillet}")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_AGENCE','GUICHETIER')")
    public ResponseEntity<ApiResponse<List<BagageView>>> getPourBillet(@PathVariable String idBillet) {
        return ResponseEntity.ok(ApiResponse.ok(bagageService.getBagagesBillet(idBillet)));
    }
}
