package me.majormate.qa.dto;

import java.time.Instant;
import java.util.UUID;

public record QaRequestResponse(
        UUID id,
        UUID requesterId,
        String requesterNickname,
        UUID targetId,
        String targetNickname,
        String message,
        String status,
        UUID chatRoomId,
        Instant createdAt
) {}
