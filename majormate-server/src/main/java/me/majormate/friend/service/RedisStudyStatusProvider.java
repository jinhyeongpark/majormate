package me.majormate.friend.service;

import lombok.RequiredArgsConstructor;
import me.majormate.friend.domain.FriendStatus;
import me.majormate.stopwatch.service.SessionStateService;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Primary
@Component
@RequiredArgsConstructor
public class RedisStudyStatusProvider implements StudyStatusProvider {

    private final SessionStateService sessionStateService;

    @Override
    public FriendStatus getStatus(UUID userId) {
        String status = sessionStateService.getStatus(userId);
        if ("STUDYING".equals(status) || "PAUSED".equals(status)) {
            return FriendStatus.STUDYING;
        }
        return FriendStatus.OFFLINE;
    }

    @Override
    public String getKeyword(UUID userId) {
        return sessionStateService.getKeyword(userId);
    }
}
