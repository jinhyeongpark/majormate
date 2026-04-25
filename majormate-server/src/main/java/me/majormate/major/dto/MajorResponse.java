package me.majormate.major.dto;

import me.majormate.major.domain.Major;

public record MajorResponse(Long id, String nameKo, String nameEn, String category) {
    public static MajorResponse from(Major major) {
        return new MajorResponse(major.getId(), major.getNameKo(), major.getNameEn(), major.getCategory());
    }
}
