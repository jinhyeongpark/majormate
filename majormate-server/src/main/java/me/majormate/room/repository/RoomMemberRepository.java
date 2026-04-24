package me.majormate.room.repository;

import me.majormate.room.domain.Room;
import me.majormate.room.domain.RoomMember;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    List<RoomMember> findAllByRoom(Room room);
    Optional<RoomMember> findByRoomAndUser(Room room, User user);
    boolean existsByRoomAndUser(Room room, User user);
    void deleteByRoomAndUser(Room room, User user);
    int countByRoom(Room room);
}
