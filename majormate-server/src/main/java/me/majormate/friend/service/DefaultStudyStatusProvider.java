package me.majormate.friend.service;

import me.majormate.friend.domain.FriendStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

// RedisStudyStatusProvider로 교체됨. 테스트용 fallback으로만 보존.
public class DefaultStudyStatusProvider implements StudyStatusProvider {

    @Override
    public FriendStatus getStatus(UUID userId) {
        return FriendStatus.OFFLINE;
    }

    @Override
    public String getKeyword(UUID userId) {
        return null;
    }
}
