package me.majormate.friend.service;

import me.majormate.friend.domain.FriendStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

// Phase 4에서 Redis 기반 구현체로 교체 예정
@Component
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
