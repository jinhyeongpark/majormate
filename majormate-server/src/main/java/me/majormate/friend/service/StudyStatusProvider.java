package me.majormate.friend.service;

import me.majormate.friend.domain.FriendStatus;

import java.util.UUID;

public interface StudyStatusProvider {
    FriendStatus getStatus(UUID userId);
    String getKeyword(UUID userId);
}
