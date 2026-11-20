package com.godtravel.backend.model.dto.packs;

import jakarta.validation.constraints.NotBlank;

public record PackSouscriptionRequest(@NotBlank String idPack, String idClient) {}
