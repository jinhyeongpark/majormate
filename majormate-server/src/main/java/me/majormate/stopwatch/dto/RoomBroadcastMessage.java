package me.majormate.stopwatch.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomBroadcastMessage {

    public enum BroadcastType {
        MEMBER_JOINED, MEMBER_LEFT,
        MEMBER_STARTED, MEMBER_PAUSED, MEMBER_RESUMED, MEMBER_ENDED,
        MEMBER_KEYWORD_UPDATED
    }

    private final BroadcastType type;
    private final UUID userId;
    private final String nickname;
    private final String status;
    private final String keyword;
    private final boolean allowQuestion;
    private final Long currentStartTimeEpoch;
    private final long accumulatedMs;
}
