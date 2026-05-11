package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.character.repository.UserItemRepository;
import me.majormate.common.service.AssetUrlService;
import me.majormate.user.domain.User;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final CharacterItemRepository characterItemRepository;
    private final UserItemRepository userItemRepository;
    private final AssetUrlService assetUrlService;

    /**
     * 전체 아이템 목록을 category ASC, name ASC 로 반환한다.
     * user 가 null 이면 owned = false 로 처리한다.
     */
    @Transactional(readOnly = true)
    public List<CharacterItemResponse> getAllItems(User user) {
        Sort sort = Sort.by(Sort.Order.asc("category"), Sort.Order.asc("name"));
        List<CharacterItem> items = characterItemRepository.findAll(sort);

        Set<UUID> ownedIds = (user != null)
                ? userItemRepository.findOwnedItemIds(user)
                : Collections.emptySet();

        return items.stream()
                .map(item -> CharacterItemResponse.from(
                        item,
                        assetUrlService.toUrl(item.getFilePath()),
                        ownedIds.contains(item.getId())
                ))
                .toList();
    }
}
