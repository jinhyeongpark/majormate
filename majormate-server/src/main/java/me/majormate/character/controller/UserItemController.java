package me.majormate.character.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.character.dto.PurchaseResponse;
import me.majormate.character.dto.UserItemResponse;
import me.majormate.character.service.UserItemService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/items")
@RequiredArgsConstructor
public class UserItemController {

    private final UserItemService userItemService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserItemResponse>> getMyItems(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = userService.getByEmail(oAuth2User.getAttribute("email"));
        return ResponseEntity.ok(userItemService.getMyItems(user));
    }

    @PostMapping("/{itemId}/purchase")
    public ResponseEntity<PurchaseResponse> purchase(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @PathVariable UUID itemId) {
        User user = userService.getByEmail(oAuth2User.getAttribute("email"));
        return ResponseEntity.ok(userItemService.purchase(user, itemId));
    }
}
