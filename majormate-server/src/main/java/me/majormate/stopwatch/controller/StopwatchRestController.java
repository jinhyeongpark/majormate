package me.majormate.stopwatch.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.BadRequestException;
import me.majormate.room.domain.Room;
import me.majormate.room.service.RoomService;
import me.majormate.stopwatch.dto.StartStopwatchRequest;
import me.majormate.stopwatch.dto.StopwatchStartRequest;
import me.majormate.stopwatch.service.StopwatchService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/stopwatch")
@RequiredArgsConstructor
public class StopwatchRestController {

    private final StopwatchService stopwatchService;
    private final UserService userService;
    private final RoomService roomService;

    @PostMapping("/start")
    public ResponseEntity<Void> start(
            @RequestBody StopwatchStartRequest req,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = resolve(oAuth2User);

        UUID roomId = req.roomId();
        if (roomId == null) {
            String major = user.getMajor();
            if (major == null) {
                throw new BadRequestException("roomId is required");
            }
            Room majorRoom = roomService.getOrCreateMajorRoom(major);
            roomId = majorRoom.getId();
        }

        stopwatchService.start(user,
                new StartStopwatchRequest(roomId, req.keyword(), req.allowQuestion()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pause")
    public ResponseEntity<Void> pause(@AuthenticationPrincipal OAuth2User oAuth2User) {
        stopwatchService.pause(resolve(oAuth2User));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resume")
    public ResponseEntity<Void> resume(@AuthenticationPrincipal OAuth2User oAuth2User) {
        stopwatchService.resume(resolve(oAuth2User));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/end")
    public ResponseEntity<Void> end(@AuthenticationPrincipal OAuth2User oAuth2User) {
        stopwatchService.end(resolve(oAuth2User));
        return ResponseEntity.ok().build();
    }

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
