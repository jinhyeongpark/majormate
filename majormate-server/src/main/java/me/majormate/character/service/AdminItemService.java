package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.common.service.AssetUrlService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminItemService {

    private final CharacterItemRepository characterItemRepository;
    private final AssetUrlService assetUrlService;

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    public CharacterItemResponse createItem(
            MultipartFile file,
            String name,
            int price,
            ItemCategory category,
            boolean isStarter
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있거나 null입니다.");
        }

        int safePrice = Math.max(0, price);
        String categoryDir = category.name().toLowerCase();
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String relativePath = "assets/characters/" + categoryDir + "/" + filename;

        Path target = Paths.get(uploadDir, "assets", "characters", categoryDir, filename);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + e.getMessage(), e);
        }

        CharacterItem item = characterItemRepository.save(
            CharacterItem.builder()
                .category(category)
                .name(name)
                .price(safePrice)
                .filePath(relativePath)
                .isStarter(isStarter)
                .build()
        );

        return CharacterItemResponse.from(item, assetUrlService.toUrl(item.getFilePath()), false);
    }
}
