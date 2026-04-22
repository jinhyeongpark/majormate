package me.majormate.character.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.dto.CharacterItemRequest;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.service.CharacterItemService;
import me.majormate.common.exception.ForbiddenException;
import me.majormate.user.domain.User;
import me.majormate.user.domain.UserRole;
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
public class CharacterItemController {

    private final CharacterItemService characterItemService;
    private final UserService userService;

    @GetMapping("/api/character-items")
    public ResponseEntity<List<CharacterItemResponse>> getItems(
            @RequestParam(required = false) ItemCategory category) {
        return ResponseEntity.ok(characterItemService.getItems(category));
    }

    @PostMapping("/api/admin/character-items")
    public ResponseEntity<CharacterItemResponse> createItem(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestBody CharacterItemRequest req) {
        requireAdmin(oAuth2User);
        return ResponseEntity.status(HttpStatus.CREATED).body(characterItemService.createItem(req));
    }

    @PutMapping("/api/admin/character-items/{id}")
    public ResponseEntity<CharacterItemResponse> updateItem(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @PathVariable UUID id,
            @RequestBody CharacterItemRequest req) {
        requireAdmin(oAuth2User);
        return ResponseEntity.ok(characterItemService.updateItem(id, req));
    }

    @DeleteMapping("/api/admin/character-items/{id}")
    public ResponseEntity<Void> deleteItem(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @PathVariable UUID id) {
        requireAdmin(oAuth2User);
        characterItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(OAuth2User oAuth2User) {
        User user = userService.getByEmail(oAuth2User.getAttribute("email"));
        if (user.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException();
        }
    }
}
