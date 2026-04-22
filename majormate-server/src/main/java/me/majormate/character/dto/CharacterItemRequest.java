package me.majormate.character.dto;

import me.majormate.character.domain.ItemCategory;

public record CharacterItemRequest(
        ItemCategory category,
        String name,
        int price,
        String filePath
) {}
