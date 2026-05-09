package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.common.service.AssetUrlService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final CharacterItemRepository characterItemRepository;
    private final AssetUrlService assetUrlService;

    /**
     * 전체 아이템을 category ASC, name ASC 로 반환한다.
     * filePath 는 DB의 상대 경로를 AssetUrlService 로 전체 URL 로 변환해 반환한다.
     */
    @Transactional(readOnly = true)
    public List<CharacterItemResponse> getAllItems() {
        Sort sort = Sort.by(Sort.Order.asc("category"), Sort.Order.asc("name"));
        List<CharacterItem> items = characterItemRepository.findAll(sort);
        return items.stream()
                .map(item -> new CharacterItemResponse(
                        item.getId(),
                        item.getCategory(),
                        item.getName(),
                        item.getPrice(),
                        assetUrlService.toUrl(item.getFilePath())
                ))
                .toList();
    }
}
