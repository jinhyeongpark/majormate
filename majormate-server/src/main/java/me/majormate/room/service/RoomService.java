package me.majormate.room.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.BadRequestException;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.common.exception.ForbiddenException;
import me.majormate.friend.repository.FriendshipRepository;
import me.majormate.room.domain.*;
import me.majormate.room.dto.*;
import me.majormate.room.repository.RoomInvitationRepository;
import me.majormate.room.repository.RoomMemberRepository;
import me.majormate.room.repository.RoomRepository;
import me.majormate.stopwatch.dto.RoomBroadcastMessage;
import me.majormate.stopwatch.dto.RoomBroadcastMessage.BroadcastType;
import me.majormate.stopwatch.service.SessionStateService;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomInvitationRepository roomInvitationRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final SessionStateService sessionStateService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<RoomResponse> getMyRooms(User user) {
        return roomMemberRepository.findAllByUser(user).stream()
                .map(m -> toResponse(m.getRoom(), user))
                .toList();
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

        if (RoomType.valueOf(req.type().toUpperCase()) == RoomType.CUSTOM
                && req.inviteeUserIds() != null) {
            Instant expiredAt = Instant.now().plus(7, ChronoUnit.DAYS);
            for (String inviteeIdStr : req.inviteeUserIds()) {
                userRepository.findById(UUID.fromString(inviteeIdStr)).ifPresent(invitee -> {
                    if (friendshipRepository.areFriends(host, invitee)) {
                        roomInvitationRepository.save(RoomInvitation.builder()
                                .room(room)
                                .inviter(host)
                                .invitee(invitee)
                                .expiredAt(expiredAt)
                                .build());
                    }
                });
            }
        }

        return toResponse(room, host);
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
        if (room.getType() == RoomType.MAJOR) {
            throw new ForbiddenException();
        }
        roomMemberRepository.deleteByRoomAndUser(room, user);
        messagingTemplate.convertAndSend("/topic/room." + roomId,
                memberBroadcast(BroadcastType.MEMBER_LEFT, user));
    }

    @Transactional
    public void sendInvitation(User host, UUID roomId, String inviteeUserIdStr) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));

        if (room.getHost() == null || !room.getHost().getId().equals(host.getId())) {
            throw new ForbiddenException();
        }

        UUID inviteeId = UUID.fromString(inviteeUserIdStr);
        User invitee = userRepository.findById(inviteeId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + inviteeId));

        if (!friendshipRepository.areFriends(host, invitee)) {
            throw new BadRequestException("친구 관계인 유저에게만 초대를 보낼 수 있습니다.");
        }

        roomInvitationRepository.findByRoomAndInviteeAndStatus(room, invitee, InvitationStatus.PENDING)
                .ifPresent(inv -> { throw new BadRequestException("이미 대기 중인 초대가 있습니다."); });

        roomInvitationRepository.save(RoomInvitation.builder()
                .room(room)
                .inviter(host)
                .invitee(invitee)
                .expiredAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build());
    }

    @Transactional(readOnly = true)
    public List<RoomInvitationResponse> getReceivedInvitations(User user) {
        return roomInvitationRepository.findByInviteeAndStatus(user, InvitationStatus.PENDING).stream()
                .map(inv -> new RoomInvitationResponse(
                        inv.getId(),
                        inv.getRoom().getId(),
                        inv.getRoom().getName(),
                        inv.getInviter().getNickname(),
                        inv.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void acceptInvitation(User user, UUID invitationId) {
        RoomInvitation invitation = roomInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Invitation not found: " + invitationId));

        if (!invitation.getInvitee().getId().equals(user.getId())) {
            throw new ForbiddenException();
        }

        invitation.accept();

        Room room = invitation.getRoom();
        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            roomMemberRepository.save(RoomMember.builder().room(room).user(user).build());
            messagingTemplate.convertAndSend("/topic/room." + room.getId(),
                    memberBroadcast(BroadcastType.MEMBER_JOINED, user));
        }
    }

    @Transactional
    public void declineInvitation(User user, UUID invitationId) {
        RoomInvitation invitation = roomInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Invitation not found: " + invitationId));

        if (!invitation.getInvitee().getId().equals(user.getId())) {
            throw new ForbiddenException();
        }

        invitation.decline();
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

    @Transactional
    public void joinMajorRoomIfAbsent(User user, String major) {
        Room room = getOrCreateMajorRoom(major);
        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            roomMemberRepository.save(RoomMember.builder().room(room).user(user).build());
        }
    }

    private RoomResponse toResponse(Room room, User currentUser) {
        boolean createdByMe = room.getHost() != null
                && room.getHost().getId().equals(currentUser.getId());
        return new RoomResponse(room.getId(), room.getName(), room.getType().name(),
                room.getMajor(), roomMemberRepository.countByRoom(room), room.getMaxMembers(),
                createdByMe);
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
