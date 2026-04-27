package me.majormate.character.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 앱 캐릭터 셋업 화면용 공개 아이템 목록 API.
 * 인증 없이 접근 가능하다 (SecurityConfig 참고).
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * 전체 아이템 목록을 category ASC, name ASC 순으로 반환한다.
     */
    @GetMapping
    public ResponseEntity<List<CharacterItemResponse>> getItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }
}
