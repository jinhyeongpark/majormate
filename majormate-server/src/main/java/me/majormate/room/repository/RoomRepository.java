package me.majormate.room.repository;

import me.majormate.room.domain.Room;
import me.majormate.room.domain.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByType(RoomType type);
    List<Room> findAllByTypeAndMajor(RoomType type, String major);
    Optional<Room> findByTypeAndMajor(RoomType type, String major);
}
