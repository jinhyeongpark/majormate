package me.majormate.qa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.majormate.qa.dto.ChatMessageResponse;
import me.majormate.qa.dto.QaRequestCreateRequest;
import me.majormate.qa.dto.QaRequestResponse;
import me.majormate.qa.service.QaService;
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
@RequestMapping("/api/qa")
@RequiredArgsConstructor
public class QaController {

    private final QaService qaService;
    private final UserService userService;

    @PostMapping("/request")
    public ResponseEntity<QaRequestResponse> createRequest(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @Valid @RequestBody QaRequestCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(qaService.createRequest(resolve(oAuth2User), req));
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<QaRequestResponse> accept(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(qaService.accept(resolve(oAuth2User), requestId));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<QaRequestResponse> reject(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(qaService.reject(resolve(oAuth2User), requestId));
    }

    @GetMapping("/chat/{chatRoomId}/history")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(@PathVariable UUID chatRoomId) {
        return ResponseEntity.ok(qaService.getChatHistory(chatRoomId));
    }

    private User resolve(OAuth2User oAuth2User) {
        return userService.getByEmail(oAuth2User.getAttribute("email"));
    }
}
