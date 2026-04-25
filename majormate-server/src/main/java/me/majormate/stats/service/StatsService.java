package me.majormate.stats.service;

import lombok.RequiredArgsConstructor;
import me.majormate.stats.dto.DailyStatEntry;
import me.majormate.stats.dto.KeywordStat;
import me.majormate.stats.dto.StatsResponse;
import me.majormate.stopwatch.domain.StudySession;
import me.majormate.stopwatch.repository.StudySessionRepository;
import me.majormate.user.domain.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StudySessionRepository studySessionRepository;

    @Transactional(readOnly = true)
    public StatsResponse getStats(User user, String period) {
        LocalDateTime since = "MONTHLY".equalsIgnoreCase(period)
                ? LocalDateTime.now().minusMonths(1)
                : LocalDateTime.now().minusWeeks(1);

        List<StudySession> sessions = studySessionRepository.findCompletedSince(user, since);

        Map<LocalDate, Long> msPerDay = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getEndedAt().toLocalDate(),
                        Collectors.summingLong(s -> s.getTotalDurationMs() != null ? s.getTotalDurationMs() : 0L)
                ));

        List<DailyStatEntry> dailyBreakdown = new ArrayList<>();
        for (LocalDate d = since.toLocalDate(); !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            dailyBreakdown.add(new DailyStatEntry(d, msPerDay.getOrDefault(d, 0L) / 1000));
        }

        Map<String, Long> keywordCounts = sessions.stream()
                .filter(s -> s.getKeyword() != null && !s.getKeyword().isBlank())
                .collect(Collectors.groupingBy(StudySession::getKeyword, Collectors.counting()));

        List<KeywordStat> topKeywords = keywordCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new KeywordStat(e.getKey(), e.getValue().intValue()))
                .toList();

        long totalSeconds = sessions.stream()
                .mapToLong(s -> s.getTotalDurationMs() != null ? s.getTotalDurationMs() / 1000 : 0L)
                .sum();

        return new StatsResponse(period.toUpperCase(), totalSeconds, dailyBreakdown, topKeywords);
    }
}
