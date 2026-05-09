package me.majormate.room.repository;

import me.majormate.room.domain.InvitationStatus;
import me.majormate.room.domain.Room;
import me.majormate.room.domain.RoomInvitation;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomInvitationRepository extends JpaRepository<RoomInvitation, UUID> {

    List<RoomInvitation> findByInviteeAndStatus(User invitee, InvitationStatus status);

    Optional<RoomInvitation> findByRoomAndInviteeAndStatus(Room room, User invitee, InvitationStatus status);

    @Modifying
    @Query("UPDATE RoomInvitation i SET i.status = 'EXPIRED' WHERE i.status = 'PENDING' AND i.expiredAt < :now")
    int expireAllBefore(@Param("now") Instant now);
}
