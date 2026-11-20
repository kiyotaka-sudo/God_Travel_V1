package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.promotion.PromotionCodeRequest;
import com.godtravel.backend.model.dto.promotion.PromotionValidationView;
import com.godtravel.backend.model.dto.promotion.PromotionView;
import com.godtravel.backend.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @PostMapping("/verifier")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN','GUICHETIER')")
    public ResponseEntity<ApiResponse<PromotionValidationView>> verifier(@Valid @RequestBody PromotionCodeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.verifierPromo(request.codePromo())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PromotionView>>> getPromotions() {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.getPromotions()));
    }
}
