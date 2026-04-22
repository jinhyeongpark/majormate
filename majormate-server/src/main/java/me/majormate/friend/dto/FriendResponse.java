package me.majormate.friend.dto;

import me.majormate.friend.domain.FriendStatus;

import java.util.UUID;

public record FriendResponse(
        UUID userId,
        String nickname,
        String major,
        FriendStatus status,
        String studyKeyword
) {}
