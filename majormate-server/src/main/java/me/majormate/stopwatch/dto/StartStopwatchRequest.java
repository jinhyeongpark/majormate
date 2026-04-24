package me.majormate.stopwatch.dto;

import java.util.UUID;

public record StartStopwatchRequest(
        UUID roomId,
        String keyword,
        boolean allowQuestion
) {}
