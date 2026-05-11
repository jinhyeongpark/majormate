package me.majormate.stopwatch.dto;

import java.util.UUID;

public record StopwatchStartRequest(
        UUID roomId,      // null이면 서버가 유저의 전공방으로 자동 해석
        String keyword,
        boolean allowQuestion
) {}
