package me.majormate.user.dto;

import jakarta.validation.constraints.Size;
import me.majormate.user.domain.Gender;

public record ProfileUpdateRequest(
        @Size(min = 2, max = 20) String nickname,
        String major,
        String nationality,
        Gender gender
) {}
