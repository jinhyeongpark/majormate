package me.majormate.room.dto;

public record CreateRoomRequest(
        String name,
        String type,
        String major,
        Integer maxMembers
) {}
