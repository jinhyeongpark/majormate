package me.majormate.character.dto;

import me.majormate.character.domain.ItemCategory;
import me.majormate.character.domain.UserItem;

import java.time.Instant;
import java.util.UUID;

public record UserItemResponse(
        UUID itemId,
        ItemCategory category,
        String name,
        String filePath,
        Instant acquiredAt
) {
    public static UserItemResponse from(UserItem userItem, String fileUrl) {
        return new UserItemResponse(
                userItem.getItem().getId(),
                userItem.getItem().getCategory(),
                userItem.getItem().getName(),
                fileUrl,
                userItem.getAcquiredAt()
        );
    }
}
