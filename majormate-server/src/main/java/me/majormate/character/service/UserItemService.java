package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.UserItem;
import me.majormate.character.dto.CharacterResponse;
import me.majormate.character.dto.PurchaseResponse;
import me.majormate.character.dto.UserItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.character.repository.UserItemRepository;
import me.majormate.common.exception.BadRequestException;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.common.service.AssetUrlService;
import me.majormate.point.domain.UserPoint;
import me.majormate.point.repository.UserPointRepository;
import me.majormate.user.domain.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserItemService {

    private final UserItemRepository userItemRepository;
    private final CharacterItemRepository characterItemRepository;
    private final UserPointRepository userPointRepository;
    private final CharacterService characterService;
    private final AssetUrlService assetUrlService;

    @Transactional(readOnly = true)
    public List<UserItemResponse> getMyItems(User user) {
        return userItemRepository.findByUser(user).stream()
                .map(ui -> UserItemResponse.from(ui, assetUrlService.toUrl(ui.getItem().getFilePath())))
                .toList();
    }

    /**
     * 아이템 구매: 포인트 차감 + 소유권 부여 + 즉시 장착을 단일 트랜잭션으로 처리한다.
     */
    @Transactional
    public PurchaseResponse purchase(User user, UUID itemId) {
        CharacterItem item = characterItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("아이템을 찾을 수 없습니다: " + itemId));

        if (userItemRepository.existsByUserAndItem(user, item)) {
            throw new BadRequestException("이미 보유한 아이템입니다");
        }

        UserPoint userPoint = userPointRepository.findByUser(user)
                .orElseGet(() -> UserPoint.builder().user(user).balance(0L).build());

        if (userPoint.getBalance() < item.getPrice()) {
            throw new BadRequestException("포인트가 부족합니다");
        }

        userPoint.deduct(item.getPrice());
        userPointRepository.save(userPoint);

        userItemRepository.save(UserItem.builder().user(user).item(item).build());

        CharacterResponse equipped = characterService.equipItem(
                user,
                item.getCategory(),
                item.getFilePath()
        );

        return new PurchaseResponse(userPoint.getBalance(), equipped);
    }
}
