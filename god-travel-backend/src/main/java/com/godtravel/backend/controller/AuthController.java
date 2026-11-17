package com.godtravel.backend.controller;

import com.godtravel.backend.model.dto.ApiResponse;
import com.godtravel.backend.model.dto.auth.AuthResponse;
import com.godtravel.backend.model.dto.auth.LoginRequest;
import com.godtravel.backend.model.dto.auth.ClientRegisterRequest;
import com.godtravel.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Connexion réussie", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me() {
        AuthResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/client/inscription")
    public ResponseEntity<ApiResponse<AuthResponse>> inscrireClient(@Valid @RequestBody ClientRegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Compte client créé", authService.inscrireClient(request)));
    }

    @PostMapping("/client/connexion")
    public ResponseEntity<ApiResponse<AuthResponse>> connexionClient(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Connexion client réussie", authService.loginClient(request)));
    }
}

