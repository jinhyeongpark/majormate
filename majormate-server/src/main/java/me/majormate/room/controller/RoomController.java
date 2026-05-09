package me.majormate.room.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.room.dto.*;
import me.majormate.room.service.RoomService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final UserService userService;

    @GetMapping("/api/rooms")
    public ResponseEntity<List<RoomResponse>> getMyRooms(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        return ResponseEntity.ok(roomService.getMyRooms(resolve(oAuth2User)));
    }

    @PostMapping("/api/rooms")
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody CreateRoomRequest req,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.createRoom(resolve(oAuth2User), req));
    }

    @GetMapping("/api/rooms/{roomId}")
    public ResponseEntity<RoomDetailResponse> getRoom(@PathVariable UUID roomId) {
        return ResponseEntity.ok(roomService.getRoom(roomId));
    }

    @PostMapping("/api/rooms/{roomId}/join")
    public ResponseEntity<Void> joinRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        roomService.joinRoom(resolve(oAuth2User), roomId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        roomService.leaveRoom(resolve(oAuth2User), roomId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/rooms/{roomId}/invitations")
    public ResponseEntity<Void> sendInvitation(
            @PathVariable UUID roomId,
            @RequestBody InviteToRoomRequest req,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        roomService.sendInvitation(resolve(oAuth2User), roomId, req.inviteeUserId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/api/rooms/invitations/received")
    public ResponseEntity<List<RoomInvitationResponse>> getReceivedInvitations(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        return ResponseEntity.ok(roomService.getReceivedInvitations(resolve(oAuth2User)));
    }

    @PostMapping("/api/rooms/invitations/{invitationId}/accept")
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        roomService.acceptInvitation(resolve(oAuth2User), invitationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/rooms/invitations/{invitationId}/decline")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        roomService.declineInvitation(resolve(oAuth2User), invitationId);
        return ResponseEntity.ok().build();
    }

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
