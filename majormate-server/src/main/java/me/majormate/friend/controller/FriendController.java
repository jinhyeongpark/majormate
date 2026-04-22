package me.majormate.friend.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.friend.dto.AddFriendRequest;
import me.majormate.friend.dto.FriendCodeResponse;
import me.majormate.friend.dto.FriendResponse;
import me.majormate.friend.service.FriendService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final UserService userService;

    @GetMapping("/api/users/me/friend-code")
    public ResponseEntity<FriendCodeResponse> getMyFriendCode(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        return ResponseEntity.ok(friendService.getMyFriendCode(resolve(oAuth2User)));
    }

    @GetMapping("/api/friends")
    public ResponseEntity<List<FriendResponse>> getFriends(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        return ResponseEntity.ok(friendService.getFriends(resolve(oAuth2User)));
    }

    @PostMapping("/api/friends")
    public ResponseEntity<FriendResponse> addFriend(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestBody AddFriendRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(friendService.addFriend(resolve(oAuth2User), req));
    }

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
