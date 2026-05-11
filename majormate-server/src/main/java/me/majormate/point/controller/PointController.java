package me.majormate.point.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.point.dto.IapWebhookRequest;
import me.majormate.point.dto.PointsResponse;
import me.majormate.point.service.UserPointService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PointController {

    private final UserPointService userPointService;
    private final UserService userService;

    @GetMapping("/api/users/me/points")
    public ResponseEntity<PointsResponse> getMyPoints(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = userService.getByEmail(oAuth2User.getAttribute("email"));
        return ResponseEntity.ok(userPointService.getBalance(user));
    }

    /**
     * IAP 영수증 검증 & 포인트 충전 Webhook.
     * MVP: permitAll, 보안 서명 검증은 추후 구현.
     */
    @PostMapping("/api/points/iap/webhook")
    public ResponseEntity<PointsResponse> iapWebhook(@RequestBody IapWebhookRequest req) {
        return ResponseEntity.ok(userPointService.processIap(req));
    }
}
