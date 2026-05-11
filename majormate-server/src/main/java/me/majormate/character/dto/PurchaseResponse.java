package me.majormate.character.dto;

public record PurchaseResponse(
        long balance,
        CharacterResponse equippedCharacter
) {
}
