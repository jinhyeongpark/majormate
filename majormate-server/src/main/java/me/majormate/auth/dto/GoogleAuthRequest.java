package me.majormate.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(String idToken, @NotBlank String accessToken) {}
