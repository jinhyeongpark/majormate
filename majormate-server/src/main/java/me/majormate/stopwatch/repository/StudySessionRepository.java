package me.majormate.stopwatch.repository;

import me.majormate.stopwatch.domain.StudySession;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {

    @Query("SELECT s FROM StudySession s WHERE s.user = :user AND s.endedAt >= :since AND s.endedAt IS NOT NULL ORDER BY s.endedAt ASC")
    List<StudySession> findCompletedSince(@Param("user") User user, @Param("since") LocalDateTime since);
}
