package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.repository.CharacterItemRepository;
import org.springframework.beans.factory.annotation.Value;
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
 * filePath 는 앱이 Image source={{ uri }} 로 직접 사용하는 전체 URL 이다.
 * 개발 환경: http://localhost:8082/assets/characters/{gender}/{category}/{filename}
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CharacterItemDataInitializer implements ApplicationRunner {

    private final CharacterItemRepository characterItemRepository;

    @Value("${asset.base-url:http://localhost:8082}")
    private String assetBaseUrl;

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
            log.info("[CharacterItemDataInitializer] 이미 아이템이 존재합니다. 시딩을 건너뜁니다.");
            return;
        }

        List<CharacterItem> seeds = new ArrayList<>();
        for (String gender : GENDERS) {
            for (ItemCategory category : CATEGORIES) {
                String categoryLower = category.name().toLowerCase();
                for (int i = 1; i <= ITEMS_PER_CATEGORY; i++) {
                    String filename = String.format("%s_%02d.png", categoryLower, i);
                    String filePath = String.format(
                            "%s/assets/characters/%s/%s/%s",
                            assetBaseUrl, gender, categoryLower, filename
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
