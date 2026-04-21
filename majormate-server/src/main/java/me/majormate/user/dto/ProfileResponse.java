package me.majormate.user.dto;

import me.majormate.character.dto.CharacterResponse;
import me.majormate.user.domain.Gender;
import me.majormate.user.domain.User;

import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String email,
        String nickname,
        String major,
        String nationality,
        Gender gender,
        String friendCode,
        CharacterResponse character
) {
    public static ProfileResponse of(User user, CharacterResponse character) {
        return new ProfileResponse(
                user.getId(), user.getEmail(), user.getNickname(),
                user.getMajor(), user.getNationality(), user.getGender(),
                user.getFriendCode(), character);
    }
}
