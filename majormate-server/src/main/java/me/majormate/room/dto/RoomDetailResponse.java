package me.majormate.room.dto;

import java.util.List;
import java.util.UUID;

public record RoomDetailResponse(
        UUID id,
        String name,
        String type,
        String major,
        int memberCount,
        int maxMembers,
        List<RoomMemberStatusResponse> members
) {}
