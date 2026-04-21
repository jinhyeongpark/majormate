package me.majormate.character.dto;

public record CharacterUpdateRequest(
        String gender,
        String bottom,
        String top,
        String shoes,
        String hair,
        String bag,
        String glasses,
        String item
) {}
