package me.majormate.room.dto;

import java.util.UUID;

public record RoomResponse(
        UUID id,
        String name,
        String type,
        String major,
        int memberCount,
        int maxMembers
) {}
