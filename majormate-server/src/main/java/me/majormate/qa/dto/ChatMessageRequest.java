package me.majormate.qa.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(@NotBlank String content) {}
