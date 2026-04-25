package me.majormate.stats.dto;

import java.util.List;

public record StatsResponse(
        String period,
        long totalSeconds,
        List<DailyStatEntry> dailyBreakdown,
        List<KeywordStat> topKeywords
) {}
