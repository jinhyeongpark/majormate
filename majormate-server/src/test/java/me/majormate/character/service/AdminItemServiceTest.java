package me.majormate.character.service;

import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import me.majormate.character.dto.CharacterItemResponse;
import me.majormate.character.repository.CharacterItemRepository;
import me.majormate.common.service.AssetUrlService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminItemService")
class AdminItemServiceTest {

    @Mock
    CharacterItemRepository characterItemRepository;

    @Mock
    AssetUrlService assetUrlService;

    @InjectMocks
    AdminItemService adminItemService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminItemService, "uploadDir", tempDir.toString());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 공통 픽스처
    // ──────────────────────────────────────────────────────────────────────────

    private MockMultipartFile validFile(String originalFilename) {
        return new MockMultipartFile(
                "file",
                originalFilename,
                "image/png",
                new byte[]{1, 2, 3}   // non-empty content
        );
    }

    private CharacterItem savedItem(UUID id, ItemCategory category, String name, int price, String filePath) {
        return CharacterItem.builder()
                .id(id)
                .category(category)
                .name(name)
                .price(price)
                .filePath(filePath)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // createItem
    // ──────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createItem 메서드는")
    class Describe_createItem {

        @Nested
        @DisplayName("유효한 파일과 파라미터가 전달되면")
        class Context_with_valid_file_and_params {

            @Test
            @DisplayName("저장된 아이템 정보를 CharacterItemResponse로 반환한다")
            void it_returns_item_response() {
                // given
                UUID id = UUID.randomUUID();
                String filename = "hair_01.png";
                MockMultipartFile file = validFile(filename);
                ItemCategory category = ItemCategory.HAIR;
                String expectedRelativePath = "assets/characters/hair/" + id + "_" + filename;
                String expectedUrl = "http://localhost:8082/" + expectedRelativePath;

                CharacterItem item = savedItem(id, category, "기본 헤어", 100, expectedRelativePath);
                given(characterItemRepository.save(any(CharacterItem.class))).willReturn(item);
                given(assetUrlService.toUrl(expectedRelativePath)).willReturn(expectedUrl);

                // when
                CharacterItemResponse response = adminItemService.createItem(file, "기본 헤어", 100, category, false);

                // then
                assertThat(response).isNotNull();
                assertThat(response.id()).isEqualTo(id);
                assertThat(response.category()).isEqualTo(category);
                assertThat(response.name()).isEqualTo("기본 헤어");
                assertThat(response.price()).isEqualTo(100);
                assertThat(response.filePath()).isEqualTo(expectedUrl);
            }

            @Test
            @DisplayName("CharacterItemRepository.save()를 정확히 1번 호출한다")
            void it_calls_save_once() {
                // given
                MockMultipartFile file = validFile("top_01.png");
                CharacterItem item = savedItem(UUID.randomUUID(), ItemCategory.TOP, "흰 셔츠", 200,
                        "assets/characters/top/uuid_top_01.png");
                given(characterItemRepository.save(any(CharacterItem.class))).willReturn(item);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/top/uuid_top_01.png");

                // when
                adminItemService.createItem(file, "흰 셔츠", 200, ItemCategory.TOP, false);

                // then
                verify(characterItemRepository).save(any(CharacterItem.class));
            }
        }

        @Nested
        @DisplayName("파일 경로 규칙에서")
        class Context_file_path_rules {

            @Test
            @DisplayName("저장되는 filePath는 assets/characters/{category_lowercase}/{UUID}_{originalFilename} 형식이다")
            void it_stores_relative_path_with_correct_format() {
                // given
                String filename = "shoes_01.png";
                MockMultipartFile file = validFile(filename);
                ItemCategory category = ItemCategory.SHOES;

                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), category, "운동화", 300,
                        "assets/characters/shoes/some-uuid_shoes_01.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/shoes/some-uuid_shoes_01.png");

                // when
                adminItemService.createItem(file, "운동화", 300, category, false);

                // then
                CharacterItem capturedItem = captor.getValue();
                assertThat(capturedItem.getFilePath())
                        .startsWith("assets/characters/shoes/")
                        .endsWith("_" + filename);
            }

            @Test
            @DisplayName("응답의 filePath는 AssetUrlService.toUrl()이 반환한 전체 URL이다")
            void it_returns_full_url_in_response() {
                // given
                MockMultipartFile file = validFile("bag_01.png");
                ItemCategory category = ItemCategory.BAG;
                String relPath = "assets/characters/bag/abc123_bag_01.png";
                String fullUrl = "http://localhost:8082/" + relPath;

                CharacterItem item = savedItem(UUID.randomUUID(), category, "백팩", 500, relPath);
                given(characterItemRepository.save(any(CharacterItem.class))).willReturn(item);
                given(assetUrlService.toUrl(item.getFilePath())).willReturn(fullUrl);

                // when
                CharacterItemResponse response = adminItemService.createItem(file, "백팩", 500, category, false);

                // then
                assertThat(response.filePath()).isEqualTo(fullUrl);
                verify(assetUrlService).toUrl(item.getFilePath());
            }
        }

        @Nested
        @DisplayName("isStarter 파라미터가")
        class Context_isStarter_flag {

            @Test
            @DisplayName("true이면 save에 전달되는 엔티티에 isStarter=true가 반영된다")
            void it_passes_isStarter_true_to_saved_entity() {
                // given
                MockMultipartFile file = validFile("hair_starter.png");
                ItemCategory category = ItemCategory.HAIR;

                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), category, "스타터 헤어", 0,
                        "assets/characters/hair/uuid_hair_starter.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/hair/uuid_hair_starter.png");

                // when
                adminItemService.createItem(file, "스타터 헤어", 0, category, true);

                // then
                // isStarter 필드가 CharacterItem 엔티티에 추가되면 아래 검증이 통과해야 한다
                // (현재 엔티티에 isStarter 필드가 없으므로 이 테스트는 RED 상태로 유지된다)
                CharacterItem capturedItem = captor.getValue();
                assertThat(capturedItem).extracting("isStarter").isEqualTo(true);
            }

            @Test
            @DisplayName("false이면 save에 전달되는 엔티티에 isStarter=false가 반영된다")
            void it_passes_isStarter_false_to_saved_entity() {
                // given
                MockMultipartFile file = validFile("top_02.png");
                ItemCategory category = ItemCategory.TOP;

                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), category, "일반 상의", 200,
                        "assets/characters/top/uuid_top_02.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/top/uuid_top_02.png");

                // when
                adminItemService.createItem(file, "일반 상의", 200, category, false);

                // then
                CharacterItem capturedItem = captor.getValue();
                assertThat(capturedItem).extracting("isStarter").isEqualTo(false);
            }
        }

        @Nested
        @DisplayName("price가 음수이면")
        class Context_with_negative_price {

            @Test
            @DisplayName("0으로 보정해서 저장한다")
            void it_corrects_negative_price_to_zero() {
                // given
                MockMultipartFile file = validFile("glasses_01.png");
                ItemCategory category = ItemCategory.GLASSES;

                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), category, "안경", 0,
                        "assets/characters/glasses/uuid_glasses_01.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/glasses/uuid_glasses_01.png");

                // when
                adminItemService.createItem(file, "안경", -500, category, false);

                // then
                CharacterItem capturedItem = captor.getValue();
                assertThat(capturedItem.getPrice()).isEqualTo(0);
            }

            @Test
            @DisplayName("응답의 price도 0으로 반환된다")
            void it_returns_zero_price_in_response() {
                // given
                MockMultipartFile file = validFile("item_01.png");
                ItemCategory category = ItemCategory.ITEM;

                CharacterItem saved = savedItem(UUID.randomUUID(), category, "무료 아이템", 0,
                        "assets/characters/item/uuid_item_01.png");
                given(characterItemRepository.save(any(CharacterItem.class))).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/item/uuid_item_01.png");

                // when
                CharacterItemResponse response = adminItemService.createItem(file, "무료 아이템", -1, category, false);

                // then
                assertThat(response.price()).isEqualTo(0);
            }
        }

        @Nested
        @DisplayName("price가 0이면")
        class Context_with_zero_price {

            @Test
            @DisplayName("0을 그대로 유지해서 저장한다")
            void it_stores_zero_price_as_is() {
                // given
                MockMultipartFile file = validFile("bottom_01.png");
                ItemCategory category = ItemCategory.BOTTOM;

                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), category, "무료 바지", 0,
                        "assets/characters/bottom/uuid_bottom_01.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/bottom/uuid_bottom_01.png");

                // when
                adminItemService.createItem(file, "무료 바지", 0, category, false);

                // then
                CharacterItem capturedItem = captor.getValue();
                assertThat(capturedItem.getPrice()).isEqualTo(0);
            }
        }

        @Nested
        @DisplayName("file이 null이면")
        class Context_with_null_file {

            @Test
            @DisplayName("IllegalArgumentException을 던진다")
            void it_throws_illegal_argument_exception() {
                assertThatThrownBy(() ->
                        adminItemService.createItem(null, "헤어", 100, ItemCategory.HAIR, false)
                ).isInstanceOf(IllegalArgumentException.class);
            }

            @Test
            @DisplayName("CharacterItemRepository.save()를 호출하지 않는다")
            void it_does_not_call_save() {
                // when & then
                assertThatThrownBy(() ->
                        adminItemService.createItem(null, "헤어", 100, ItemCategory.HAIR, false)
                ).isInstanceOf(IllegalArgumentException.class);

                verify(characterItemRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("file이 비어있으면 (isEmpty() == true)")
        class Context_with_empty_file {

            @Test
            @DisplayName("IllegalArgumentException을 던진다")
            void it_throws_illegal_argument_exception() {
                // given — MockMultipartFile with no content
                MockMultipartFile emptyFile = new MockMultipartFile(
                        "file", "hair_01.png", "image/png", new byte[0]
                );

                assertThatThrownBy(() ->
                        adminItemService.createItem(emptyFile, "헤어", 100, ItemCategory.HAIR, false)
                ).isInstanceOf(IllegalArgumentException.class);
            }

            @Test
            @DisplayName("CharacterItemRepository.save()를 호출하지 않는다")
            void it_does_not_call_save_on_empty_file() {
                // given
                MockMultipartFile emptyFile = new MockMultipartFile(
                        "file", "hair_01.png", "image/png", new byte[0]
                );

                // when & then
                assertThatThrownBy(() ->
                        adminItemService.createItem(emptyFile, "헤어", 100, ItemCategory.HAIR, false)
                ).isInstanceOf(IllegalArgumentException.class);

                verify(characterItemRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("카테고리별 저장 경로 포맷에서")
        class Context_category_path_format {

            @Test
            @DisplayName("HAIR 카테고리는 assets/characters/hair/ 경로에 저장된다")
            void it_uses_hair_lowercase_directory() {
                // given
                MockMultipartFile file = validFile("test_hair.png");
                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), ItemCategory.HAIR, "테스트", 0,
                        "assets/characters/hair/uuid_test_hair.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/hair/uuid_test_hair.png");

                // when
                adminItemService.createItem(file, "테스트", 0, ItemCategory.HAIR, false);

                // then
                assertThat(captor.getValue().getFilePath())
                        .startsWith("assets/characters/hair/");
            }

            @Test
            @DisplayName("BOTTOM 카테고리는 assets/characters/bottom/ 경로에 저장된다")
            void it_uses_bottom_lowercase_directory() {
                // given
                MockMultipartFile file = validFile("test_bottom.png");
                ArgumentCaptor<CharacterItem> captor = ArgumentCaptor.forClass(CharacterItem.class);
                CharacterItem saved = savedItem(UUID.randomUUID(), ItemCategory.BOTTOM, "테스트", 0,
                        "assets/characters/bottom/uuid_test_bottom.png");
                given(characterItemRepository.save(captor.capture())).willReturn(saved);
                given(assetUrlService.toUrl(anyString())).willReturn("http://localhost:8082/assets/characters/bottom/uuid_test_bottom.png");

                // when
                adminItemService.createItem(file, "테스트", 0, ItemCategory.BOTTOM, false);

                // then
                assertThat(captor.getValue().getFilePath())
                        .startsWith("assets/characters/bottom/");
            }
        }
    }
}
