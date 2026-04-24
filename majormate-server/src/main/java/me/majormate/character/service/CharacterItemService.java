package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.dto.CharacterItemRequest;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.common.service.AssetUrlService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharacterItemService {

    private final CharacterItemRepository characterItemRepository;
    private final AssetUrlService assetUrlService;

    @Transactional(readOnly = true)
    public List<CharacterItemResponse> getItems(ItemCategory category) {
        List<CharacterItem> items = (category != null)
                ? characterItemRepository.findByCategory(category)
                : characterItemRepository.findAll();
        return items.stream().map(this::toResponse).toList();
    }

    @Transactional
    public CharacterItemResponse createItem(CharacterItemRequest req) {
        CharacterItem item = CharacterItem.builder()
                .category(req.category())
                .name(req.name())
                .price(req.price())
                .filePath(req.filePath())
                .build();
        return toResponse(characterItemRepository.save(item));
    }

    @Transactional
    public CharacterItemResponse updateItem(UUID id, CharacterItemRequest req) {
        CharacterItem item = characterItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("아이템을 찾을 수 없습니다: " + id));
        item.update(req.category(), req.name(), req.price(), req.filePath());
        return toResponse(characterItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID id) {
        if (!characterItemRepository.existsById(id)) {
            throw new EntityNotFoundException("아이템을 찾을 수 없습니다: " + id);
        }
        characterItemRepository.deleteById(id);
    }

    private CharacterItemResponse toResponse(CharacterItem item) {
        return new CharacterItemResponse(
                item.getId(),
                item.getCategory(),
                item.getName(),
                item.getPrice(),
                assetUrlService.toUrl(item.getFilePath())
        );
    }
}
