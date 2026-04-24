package me.majormate.room.dto;

import java.util.UUID;

public record RoomMemberStatusResponse(
        UUID userId,
        String nickname,
        String status,
        String keyword,
        boolean allowQuestion,
        Long currentStartTimeEpoch,
        long accumulatedMs
) {}
