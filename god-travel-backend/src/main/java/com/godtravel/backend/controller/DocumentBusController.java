package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.documents.DocumentBusRequest;
import com.godtravel.backend.model.dto.documents.DocumentBusView;
import com.godtravel.backend.model.entity.Bus;
import com.godtravel.backend.model.entity.TypeDocument;
import com.godtravel.backend.service.DocumentBusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents-bus")
@RequiredArgsConstructor
public class DocumentBusController {
    private final DocumentBusService documentBusService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MECANICIEN')")
    public ResponseEntity<ApiResponse<List<DocumentBusView>>> getDocuments() {
        return ResponseEntity.ok(ApiResponse.ok(documentBusService.getDocuments()));
    }

    @GetMapping("/alertes")
    @PreAuthorize("hasAnyRole('ADMIN','MECANICIEN','CHEF_AGENCE')")
    public ResponseEntity<ApiResponse<List<DocumentBusView>>> getAlertes() {
        return ResponseEntity.ok(ApiResponse.ok(documentBusService.getAlertes()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MECANICIEN')")
    public ResponseEntity<ApiResponse<DocumentBusView>> enregistrer(@Valid @RequestBody DocumentBusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Document bus enregistré.", documentBusService.enregistrer(request)));
    }

    @GetMapping("/bus")
    @PreAuthorize("hasAnyRole('ADMIN','MECANICIEN')")
    public ResponseEntity<ApiResponse<List<Bus>>> getBus() {
        return ResponseEntity.ok(ApiResponse.ok(documentBusService.getBus()));
    }

    @GetMapping("/types")
    @PreAuthorize("hasAnyRole('ADMIN','MECANICIEN')")
    public ResponseEntity<ApiResponse<List<TypeDocument>>> getTypes() {
        return ResponseEntity.ok(ApiResponse.ok(documentBusService.getTypes()));
    }
}
