package me.majormate.room.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.room.domain.Room;
import me.majormate.room.domain.RoomMember;
import me.majormate.room.domain.RoomType;
import me.majormate.room.dto.CreateRoomRequest;
import me.majormate.room.dto.RoomDetailResponse;
import me.majormate.room.dto.RoomMemberStatusResponse;
import me.majormate.room.dto.RoomResponse;
import me.majormate.room.repository.RoomMemberRepository;
import me.majormate.room.repository.RoomRepository;
import me.majormate.stopwatch.dto.RoomBroadcastMessage;
import me.majormate.stopwatch.dto.RoomBroadcastMessage.BroadcastType;
import me.majormate.stopwatch.service.SessionStateService;
import me.majormate.user.domain.User;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final SessionStateService sessionStateService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<RoomResponse> getRooms(String typeStr, String major) {
        if (typeStr == null) {
            return roomRepository.findAll().stream().map(this::toResponse).toList();
        }
        RoomType type = RoomType.valueOf(typeStr.toUpperCase());
        if (major != null && !major.isBlank()) {
            return roomRepository.findAllByTypeAndMajor(type, major).stream().map(this::toResponse).toList();
        }
        return roomRepository.findAllByType(type).stream().map(this::toResponse).toList();
    }

    @Transactional
    public RoomResponse createRoom(User host, CreateRoomRequest req) {
        Room room = roomRepository.save(Room.builder()
                .name(req.name())
                .type(RoomType.valueOf(req.type().toUpperCase()))
                .host(host)
                .major(req.major())
                .maxMembers(req.maxMembers() != null ? req.maxMembers() : 30)
                .build());
        roomMemberRepository.save(RoomMember.builder().room(room).user(host).build());
        return toResponse(room);
    }

    public RoomDetailResponse getRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        List<RoomMemberStatusResponse> members = roomMemberRepository.findAllByRoom(room).stream()
                .map(m -> toMemberStatus(m.getUser()))
                .toList();
        return new RoomDetailResponse(room.getId(), room.getName(), room.getType().name(),
                room.getMajor(), members.size(), room.getMaxMembers(), members);
    }

    @Transactional
    public void joinRoom(User user, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            roomMemberRepository.save(RoomMember.builder().room(room).user(user).build());
            messagingTemplate.convertAndSend("/topic/room." + roomId,
                    memberBroadcast(BroadcastType.MEMBER_JOINED, user));
        }
    }

    @Transactional
    public void leaveRoom(User user, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        roomMemberRepository.deleteByRoomAndUser(room, user);
        messagingTemplate.convertAndSend("/topic/room." + roomId,
                memberBroadcast(BroadcastType.MEMBER_LEFT, user));
    }

    @Transactional
    public Room getOrCreateMajorRoom(String major) {
        return roomRepository.findByTypeAndMajor(RoomType.MAJOR, major)
                .orElseGet(() -> roomRepository.save(Room.builder()
                        .name(major + " Study Room")
                        .type(RoomType.MAJOR)
                        .major(major)
                        .build()));
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(room.getId(), room.getName(), room.getType().name(),
                room.getMajor(), roomMemberRepository.countByRoom(room), room.getMaxMembers());
    }

    private RoomMemberStatusResponse toMemberStatus(User u) {
        String status = sessionStateService.getStatus(u.getId());
        return new RoomMemberStatusResponse(
                u.getId(), u.getNickname(),
                status != null ? status : "OFFLINE",
                sessionStateService.getKeyword(u.getId()),
                sessionStateService.isAllowQuestion(u.getId()),
                sessionStateService.getCurrentStartTime(u.getId()),
                sessionStateService.getAccumulatedMs(u.getId())
        );
    }

    private RoomBroadcastMessage memberBroadcast(BroadcastType type, User user) {
        String status = sessionStateService.getStatus(user.getId());
        return RoomBroadcastMessage.builder()
                .type(type)
                .userId(user.getId())
                .nickname(user.getNickname())
                .status(status != null ? status : "OFFLINE")
                .keyword(sessionStateService.getKeyword(user.getId()))
                .allowQuestion(sessionStateService.isAllowQuestion(user.getId()))
                .currentStartTimeEpoch(sessionStateService.getCurrentStartTime(user.getId()))
                .accumulatedMs(sessionStateService.getAccumulatedMs(user.getId()))
                .build();
    }
}
