package me.majormate.room.dto;

import java.time.Instant;
import java.util.UUID;

public record RoomInvitationResponse(
        UUID id,
        UUID roomId,
        String roomName,
        String inviterNickname,
        Instant createdAt
) {}
