package me.majormate.stopwatch.repository;

import me.majormate.stopwatch.domain.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
}
