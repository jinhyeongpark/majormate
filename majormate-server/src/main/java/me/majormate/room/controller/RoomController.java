package me.majormate.room.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.room.dto.CreateRoomRequest;
import me.majormate.room.dto.RoomDetailResponse;
import me.majormate.room.dto.RoomResponse;
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
    public ResponseEntity<List<RoomResponse>> getRooms(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String major) {
        return ResponseEntity.ok(roomService.getRooms(type, major));
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

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
