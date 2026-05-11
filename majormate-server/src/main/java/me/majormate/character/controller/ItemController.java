package me.majormate.character.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.service.ItemService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 앱 캐릭터 셋업 화면용 공개 아이템 목록 API.
 * 인증 없이 접근 가능하다 (SecurityConfig 참고).
 * 인증된 사용자의 경우 owned 필드가 채워진다.
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final UserService userService;

    /**
     * 전체 아이템 목록을 category ASC, name ASC 순으로 반환한다.
     * 인증된 사용자는 owned 필드를 통해 본인 보유 여부를 확인할 수 있다.
     */
    @GetMapping
    public ResponseEntity<List<CharacterItemResponse>> getItems(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = (oAuth2User != null)
                ? userService.getByEmail(oAuth2User.getAttribute("email"))
                : null;
        return ResponseEntity.ok(itemService.getAllItems(user));
    }
}
