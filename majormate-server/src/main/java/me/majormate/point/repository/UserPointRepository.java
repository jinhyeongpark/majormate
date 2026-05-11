package me.majormate.point.repository;

import me.majormate.point.domain.UserPoint;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserPointRepository extends JpaRepository<UserPoint, UUID> {
    Optional<UserPoint> findByUser(User user);
}
