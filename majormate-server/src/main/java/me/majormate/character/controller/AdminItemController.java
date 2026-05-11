package me.majormate.character.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.service.AdminItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminItemController {

    private final AdminItemService adminItemService;

    @PostMapping(value = "/items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CharacterItemResponse> createItem(
            @RequestPart("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("price") int price,
            @RequestParam("category") ItemCategory category,
            @RequestParam(value = "isStarter", defaultValue = "false") boolean isStarter
    ) {
        CharacterItemResponse response = adminItemService.createItem(file, name, price, category, isStarter);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
