package me.majormate.stats.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.stats.dto.StatsResponse;
import me.majormate.stats.service.StatsService;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<StatsResponse> getMyStats(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam(defaultValue = "WEEKLY") String period) {
        var user = userService.getByEmail(oAuth2User.getAttribute("email"));
        return ResponseEntity.ok(statsService.getStats(user, period));
    }
}
