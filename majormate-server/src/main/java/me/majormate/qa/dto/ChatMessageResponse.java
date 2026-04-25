package me.majormate.qa.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID chatRoomId,
        UUID senderId,
        String senderNickname,
        String content,
        Instant createdAt
) {}
