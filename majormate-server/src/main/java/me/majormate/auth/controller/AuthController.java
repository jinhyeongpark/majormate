package me.majormate.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.majormate.auth.dto.GoogleAuthRequest;
import me.majormate.auth.dto.GoogleAuthResponse;
import me.majormate.auth.service.MobileGoogleAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MobileGoogleAuthService mobileGoogleAuthService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user.getAttributes());
    }

    @PostMapping("/google")
    public ResponseEntity<GoogleAuthResponse> googleMobileAuth(
            @Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(mobileGoogleAuthService.authenticate(request.idToken(), request.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        request.getSession(false);
        return ResponseEntity.noContent().build();
    }
}
