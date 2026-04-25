package me.majormate.auth.dto;

public record GoogleAuthResponse(String token, boolean isNewUser) {}
