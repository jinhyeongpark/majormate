package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.repository.CharacterItemRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 서버 시작 시 character_items 테이블에 초기 아이템 시드 데이터를 삽입한다.
 * 이미 데이터가 존재하면 건너뜀 (멱등성 보장).
 *
 * filePath 는 상대 경로만 저장한다. (예: assets/characters/male/hair/hair_01.png)
 * 응답 시 AssetUrlService 가 base-url prefix 를 붙여 전체 URL 로 변환한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CharacterItemDataInitializer implements ApplicationRunner {

    private final CharacterItemRepository characterItemRepository;

    // 앱 에셋: majormate-app/assets/characters/{gender}/{category}/{filename}
    // gender: male, female
    // category: hair, top, bottom, shoes, bag, glasses, item
    // filename: {category}_01.png … {category}_08.png

    private static final String[] GENDERS = {"male", "female"};

    private static final ItemCategory[] CATEGORIES = {
            ItemCategory.HAIR,
            ItemCategory.TOP,
            ItemCategory.BOTTOM,
            ItemCategory.SHOES,
            ItemCategory.BAG,
            ItemCategory.GLASSES,
            ItemCategory.ITEM,
    };

    private static final int ITEMS_PER_CATEGORY = 8;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (characterItemRepository.count() > 0) {
            boolean oldFormat = characterItemRepository.findAll().stream()
                    .findFirst()
                    .map(item -> item.getFilePath().startsWith("http"))
                    .orElse(false);
            if (!oldFormat) {
                log.info("[CharacterItemDataInitializer] 이미 아이템이 존재합니다. 시딩을 건너뜁니다.");
                return;
            }
            log.info("[CharacterItemDataInitializer] 구형 URL 포맷 감지. 재시딩을 실행합니다.");
            characterItemRepository.deleteAll();
        }

        List<CharacterItem> seeds = new ArrayList<>();
        for (String gender : GENDERS) {
            for (ItemCategory category : CATEGORIES) {
                String categoryLower = category.name().toLowerCase();
                for (int i = 1; i <= ITEMS_PER_CATEGORY; i++) {
                    String filename = String.format("%s_%02d.png", categoryLower, i);
                    String filePath = String.format(
                            "assets/characters/%s/%s/%s",
                            gender, categoryLower, filename
                    );
                    String itemName = String.format("%s %s %02d",
                            capitalize(gender), capitalize(categoryLower), i);

                    seeds.add(CharacterItem.builder()
                            .category(category)
                            .name(itemName)
                            .price(0)
                            .filePath(filePath)
                            .build());
                }
            }
        }

        characterItemRepository.saveAll(seeds);
        log.info("[CharacterItemDataInitializer] {}개 아이템 시딩 완료.", seeds.size());
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
