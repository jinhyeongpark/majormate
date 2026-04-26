package me.majormate.user.service;

import me.majormate.character.dto.CharacterResponse;
import me.majormate.character.service.CharacterService;
import me.majormate.common.exception.BadRequestException;
import me.majormate.major.service.MajorService;
import me.majormate.user.domain.Gender;
import me.majormate.user.domain.User;
import me.majormate.user.dto.ProfileResponse;
import me.majormate.user.dto.ProfileUpdateRequest;
import me.majormate.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    CharacterService characterService;

    @Mock
    MajorService majorService;

    @InjectMocks
    UserService userService;

    // ────────────────────────────────────────────────────────────────────────
    // 공통 픽스처
    // ────────────────────────────────────────────────────────────────────────

    private User buildUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .nickname("테스터")
                .major("CS")
                .friendCode("ABCD1234")
                .build();
    }

    private CharacterResponse stubCharacter() {
        return new CharacterResponse("male", null, null, null, null, null, null, null);
    }

    // ────────────────────────────────────────────────────────────────────────
    // getProfile
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getProfile 메서드는")
    class Describe_getProfile {

        @Nested
        @DisplayName("정상적인 유저가 주어지면")
        class Context_with_valid_user {

            @Test
            @DisplayName("characterService.getCharacter 를 호출하고 ProfileResponse 를 반환한다")
            void it_calls_character_service_and_returns_profile_response() {
                User user = buildUser();
                CharacterResponse character = stubCharacter();
                given(characterService.getCharacter(user)).willReturn(character);

                ProfileResponse response = userService.getProfile(user);

                verify(characterService).getCharacter(user);
                assertThat(response.id()).isEqualTo(user.getId());
                assertThat(response.email()).isEqualTo(user.getEmail());
                assertThat(response.nickname()).isEqualTo(user.getNickname());
                assertThat(response.major()).isEqualTo(user.getMajor());
                assertThat(response.character()).isEqualTo(character);
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // updateProfile
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateProfile 메서드는")
    class Describe_updateProfile {

        @Nested
        @DisplayName("req.major() 가 non-null 이고 존재하지 않는 전공이면")
        class Context_with_nonexistent_major {

            @Test
            @DisplayName("BadRequestException 을 던진다")
            void it_throws_bad_request_exception() {
                User user = buildUser();
                ProfileUpdateRequest req = new ProfileUpdateRequest(null, "UNKNOWN_MAJOR", null, null);
                given(majorService.exists("UNKNOWN_MAJOR")).willReturn(false);

                assertThatThrownBy(() -> userService.updateProfile(user, req))
                        .isInstanceOf(BadRequestException.class)
                        .hasMessageContaining("존재하지 않는 전공입니다");

                verify(userRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("req.major() 가 non-null 이고 존재하는 전공이면")
        class Context_with_valid_major {

            @Test
            @DisplayName("userRepository.save 를 호출하고 ProfileResponse 를 반환한다")
            void it_saves_user_and_returns_profile_response() {
                User user = buildUser();
                ProfileUpdateRequest req = new ProfileUpdateRequest("새닉네임", "Math", null, null);
                CharacterResponse character = stubCharacter();

                given(majorService.exists("Math")).willReturn(true);
                given(userRepository.save(user)).willReturn(user);
                given(characterService.getCharacter(user)).willReturn(character);

                ProfileResponse response = userService.updateProfile(user, req);

                verify(userRepository).save(user);
                assertThat(response).isNotNull();
                assertThat(response.character()).isEqualTo(character);
            }
        }

        @Nested
        @DisplayName("req.major() 가 null 이면")
        class Context_with_null_major {

            @Test
            @DisplayName("majorService.exists 를 호출하지 않고 save 를 호출한다")
            void it_skips_major_validation_and_saves() {
                User user = buildUser();
                ProfileUpdateRequest req = new ProfileUpdateRequest("새닉네임", null, null, null);
                CharacterResponse character = stubCharacter();

                given(userRepository.save(user)).willReturn(user);
                given(characterService.getCharacter(user)).willReturn(character);

                userService.updateProfile(user, req);

                verify(majorService, never()).exists(any());
                verify(userRepository).save(user);
            }
        }

        @Nested
        @DisplayName("req 의 모든 필드가 null 이면")
        class Context_with_all_null_fields {

            @Test
            @DisplayName("기존 값 유지 후 save 를 호출한다")
            void it_preserves_existing_values_and_saves() {
                User user = buildUser();
                ProfileUpdateRequest req = new ProfileUpdateRequest(null, null, null, null);
                CharacterResponse character = stubCharacter();

                given(userRepository.save(user)).willReturn(user);
                given(characterService.getCharacter(user)).willReturn(character);

                ProfileResponse response = userService.updateProfile(user, req);

                verify(majorService, never()).exists(any());
                verify(userRepository).save(user);
                assertThat(response.nickname()).isEqualTo(user.getNickname());
                assertThat(response.major()).isEqualTo(user.getMajor());
            }
        }

        @Nested
        @DisplayName("gender 필드가 non-null 이면")
        class Context_with_gender_field {

            @Test
            @DisplayName("gender 를 포함해 save 를 호출하고 ProfileResponse 를 반환한다")
            void it_updates_gender_and_saves() {
                User user = buildUser();
                ProfileUpdateRequest req = new ProfileUpdateRequest(null, null, null, Gender.FEMALE);
                CharacterResponse character = stubCharacter();

                given(userRepository.save(user)).willReturn(user);
                given(characterService.getCharacter(user)).willReturn(character);

                ProfileResponse response = userService.updateProfile(user, req);

                verify(userRepository).save(user);
                assertThat(response).isNotNull();
            }
        }
    }
}
