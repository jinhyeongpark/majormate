package me.majormate.room.dto;

import java.util.List;

public record CreateRoomRequest(
        String name,
        String type,
        String major,
        Integer maxMembers,
        List<String> inviteeUserIds
) {}
