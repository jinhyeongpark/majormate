package me.majormate.room.service;

import lombok.RequiredArgsConstructor;
import me.majormate.room.repository.RoomInvitationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class RoomInvitationExpireScheduler {

    private final RoomInvitationRepository roomInvitationRepository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireInvitations() {
        int count = roomInvitationRepository.expireAllBefore(Instant.now());
        if (count > 0) {
            System.out.println("[Scheduler] Expired " + count + " room invitations.");
        }
    }
}
