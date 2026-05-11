package me.majormate.character.dto;

import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;

import java.util.UUID;

public record CharacterItemResponse(
        UUID id,
        ItemCategory category,
        String name,
        int price,
        String filePath,
        boolean owned
) {
    public static CharacterItemResponse from(CharacterItem item, String fileUrl, boolean owned) {
        return new CharacterItemResponse(
                item.getId(),
                item.getCategory(),
                item.getName(),
                item.getPrice(),
                fileUrl,
                owned
        );
    }
}
