package me.majormate.qa.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record QaRequestCreateRequest(
        @NotNull UUID targetUserId,
        @Size(max = 500) String message
) {}
