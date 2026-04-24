package me.majormate.stopwatch.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.room.domain.Room;
import me.majormate.room.repository.RoomRepository;
import me.majormate.stopwatch.domain.StudySession;
import me.majormate.stopwatch.dto.RoomBroadcastMessage;
import me.majormate.stopwatch.dto.RoomBroadcastMessage.BroadcastType;
import me.majormate.stopwatch.dto.StartStopwatchRequest;
import me.majormate.stopwatch.repository.StudySessionRepository;
import me.majormate.user.domain.User;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StopwatchService {

    private final SessionStateService sessionStateService;
    private final StudySessionRepository studySessionRepository;
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void start(User user, StartStopwatchRequest req) {
        Room room = roomRepository.findById(req.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + req.roomId()));

        StudySession session = studySessionRepository.save(StudySession.builder()
                .user(user)
                .room(room)
                .keyword(req.keyword())
                .startedAt(LocalDateTime.now())
                .build());

        sessionStateService.start(user.getId(), req.keyword(), req.allowQuestion(),
                room.getId().toString(), session.getId().toString());

        broadcast(room.getId(), RoomBroadcastMessage.builder()
                .type(BroadcastType.MEMBER_STARTED)
                .userId(user.getId())
                .nickname(user.getNickname())
                .status("STUDYING")
                .keyword(req.keyword())
                .allowQuestion(req.allowQuestion())
                .currentStartTimeEpoch(sessionStateService.getCurrentStartTime(user.getId()))
                .accumulatedMs(0)
                .build());
    }

    public void pause(User user) {
        String roomId = sessionStateService.getRoomId(user.getId());
        if (roomId == null) return;
        sessionStateService.pause(user.getId());
        broadcast(UUID.fromString(roomId), RoomBroadcastMessage.builder()
                .type(BroadcastType.MEMBER_PAUSED)
                .userId(user.getId())
                .nickname(user.getNickname())
                .status("PAUSED")
                .keyword(sessionStateService.getKeyword(user.getId()))
                .allowQuestion(sessionStateService.isAllowQuestion(user.getId()))
                .accumulatedMs(sessionStateService.getAccumulatedMs(user.getId()))
                .build());
    }

    public void resume(User user) {
        String roomId = sessionStateService.getRoomId(user.getId());
        if (roomId == null) return;
        sessionStateService.resume(user.getId());
        broadcast(UUID.fromString(roomId), RoomBroadcastMessage.builder()
                .type(BroadcastType.MEMBER_RESUMED)
                .userId(user.getId())
                .nickname(user.getNickname())
                .status("STUDYING")
                .keyword(sessionStateService.getKeyword(user.getId()))
                .allowQuestion(sessionStateService.isAllowQuestion(user.getId()))
                .currentStartTimeEpoch(sessionStateService.getCurrentStartTime(user.getId()))
                .accumulatedMs(sessionStateService.getAccumulatedMs(user.getId()))
                .build());
    }

    @Transactional
    public void end(User user) {
        String roomId      = sessionStateService.getRoomId(user.getId());
        String sessionId   = sessionStateService.getSessionId(user.getId());
        String keyword     = sessionStateService.getKeyword(user.getId());
        boolean allowQ     = sessionStateService.isAllowQuestion(user.getId());
        long totalMs       = sessionStateService.end(user.getId());

        if (sessionId != null) {
            studySessionRepository.findById(UUID.fromString(sessionId))
                    .ifPresent(s -> s.end(LocalDateTime.now(), totalMs));
        }

        if (roomId != null) {
            broadcast(UUID.fromString(roomId), RoomBroadcastMessage.builder()
                    .type(BroadcastType.MEMBER_ENDED)
                    .userId(user.getId())
                    .nickname(user.getNickname())
                    .status("OFFLINE")
                    .keyword(keyword)
                    .allowQuestion(allowQ)
                    .accumulatedMs(totalMs)
                    .build());
        }
    }

    public void updateKeyword(User user, String keyword) {
        String roomId = sessionStateService.getRoomId(user.getId());
        if (roomId == null) return;
        sessionStateService.updateKeyword(user.getId(), keyword);
        broadcast(UUID.fromString(roomId), RoomBroadcastMessage.builder()
                .type(BroadcastType.MEMBER_KEYWORD_UPDATED)
                .userId(user.getId())
                .nickname(user.getNickname())
                .status("STUDYING")
                .keyword(keyword)
                .allowQuestion(sessionStateService.isAllowQuestion(user.getId()))
                .currentStartTimeEpoch(sessionStateService.getCurrentStartTime(user.getId()))
                .accumulatedMs(sessionStateService.getAccumulatedMs(user.getId()))
                .build());
    }

    private void broadcast(UUID roomId, RoomBroadcastMessage msg) {
        messagingTemplate.convertAndSend("/topic/room." + roomId, msg);
    }
}
