package me.majormate.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.majormate.character.dto.CharacterResponse;
import me.majormate.character.dto.CharacterUpdateRequest;
import me.majormate.character.service.CharacterService;
import me.majormate.user.domain.User;
import me.majormate.user.dto.ProfileResponse;
import me.majormate.user.dto.ProfileUpdateRequest;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CharacterService characterService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = resolve(oAuth2User);
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @Valid @RequestBody ProfileUpdateRequest req) {
        User user = resolve(oAuth2User);
        return ResponseEntity.ok(userService.updateProfile(user, req));
    }

    @GetMapping("/me/character")
    public ResponseEntity<CharacterResponse> getMyCharacter(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = resolve(oAuth2User);
        return ResponseEntity.ok(characterService.getCharacter(user));
    }

    @PutMapping("/me/character")
    public ResponseEntity<CharacterResponse> updateMyCharacter(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestBody CharacterUpdateRequest req) {
        User user = resolve(oAuth2User);
        return ResponseEntity.ok(characterService.updateCharacter(user, req));
    }

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
