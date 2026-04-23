package me.majormate.stopwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionStateService {

    private static final Duration SESSION_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redis;

    private String key(UUID userId, String field) {
        return "session:" + userId + ":" + field;
    }

    public void start(UUID userId, String keyword, boolean allowQuestion, String roomId, String sessionId) {
        long now = System.currentTimeMillis();
        set(userId, "status", "STUDYING");
        set(userId, "keyword", keyword != null ? keyword : "");
        set(userId, "allowQuestion", String.valueOf(allowQuestion));
        set(userId, "currentStartTime", String.valueOf(now));
        set(userId, "accumulatedMs", "0");
        set(userId, "roomId", roomId);
        set(userId, "sessionId", sessionId);
    }

    public void pause(UUID userId) {
        String startStr = redis.opsForValue().get(key(userId, "currentStartTime"));
        if (startStr == null) return;
        long elapsed = System.currentTimeMillis() - Long.parseLong(startStr);
        long accumulated = getAccumulatedMs(userId);
        set(userId, "status", "PAUSED");
        set(userId, "accumulatedMs", String.valueOf(accumulated + elapsed));
        redis.delete(key(userId, "currentStartTime"));
    }

    public void resume(UUID userId) {
        set(userId, "status", "STUDYING");
        set(userId, "currentStartTime", String.valueOf(System.currentTimeMillis()));
    }

    /** Clears all Redis state and returns total accumulated milliseconds. */
    public long end(UUID userId) {
        String statusStr = redis.opsForValue().get(key(userId, "status"));
        String startStr  = redis.opsForValue().get(key(userId, "currentStartTime"));
        long accumulated = getAccumulatedMs(userId);
        if ("STUDYING".equals(statusStr) && startStr != null) {
            accumulated += System.currentTimeMillis() - Long.parseLong(startStr);
        }
        clear(userId);
        return accumulated;
    }

    public void updateKeyword(UUID userId, String keyword) {
        set(userId, "keyword", keyword != null ? keyword : "");
    }

    public String getStatus(UUID userId) {
        return redis.opsForValue().get(key(userId, "status"));
    }

    public String getKeyword(UUID userId) {
        return redis.opsForValue().get(key(userId, "keyword"));
    }

    public String getRoomId(UUID userId) {
        return redis.opsForValue().get(key(userId, "roomId"));
    }

    public String getSessionId(UUID userId) {
        return redis.opsForValue().get(key(userId, "sessionId"));
    }

    public boolean isAllowQuestion(UUID userId) {
        return Boolean.parseBoolean(redis.opsForValue().get(key(userId, "allowQuestion")));
    }

    public Long getCurrentStartTime(UUID userId) {
        String v = redis.opsForValue().get(key(userId, "currentStartTime"));
        return v != null ? Long.parseLong(v) : null;
    }

    public long getAccumulatedMs(UUID userId) {
        String v = redis.opsForValue().get(key(userId, "accumulatedMs"));
        return v != null ? Long.parseLong(v) : 0;
    }

    private void set(UUID userId, String field, String value) {
        redis.opsForValue().set(key(userId, field), value, SESSION_TTL);
    }

    private void clear(UUID userId) {
        for (String field : new String[]{"status", "keyword", "allowQuestion", "currentStartTime",
                                         "accumulatedMs", "roomId", "sessionId"}) {
            redis.delete(key(userId, field));
        }
    }
}
