package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.entity.view.VueVoyagesDisponibles;
import com.godtravel.backend.service.BilletterieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/voyages")
@RequiredArgsConstructor
public class VoyageController {

    private final BilletterieService billetterieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VueVoyagesDisponibles>>> getVoyages() {
        List<VueVoyagesDisponibles> voyages = billetterieService.getVoyagesDisponibles();
        return ResponseEntity.ok(ApiResponse.ok(voyages));
    }

    @GetMapping("/{id}/sieges")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlanSieges(@PathVariable("id") String idVoyage) {
        Map<String, Object> plan = billetterieService.getPlanSieges(idVoyage);
        return ResponseEntity.ok(ApiResponse.ok(plan));
    }
}

