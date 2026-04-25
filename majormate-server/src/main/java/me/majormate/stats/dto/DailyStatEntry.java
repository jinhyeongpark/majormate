package me.majormate.stats.dto;

import java.time.LocalDate;

public record DailyStatEntry(LocalDate date, long seconds) {}
