package me.majormate.friend.service;

import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.friend.domain.Friendship;
import me.majormate.friend.domain.FriendStatus;
import me.majormate.friend.dto.AddFriendRequest;
import me.majormate.friend.dto.FriendResponse;
import me.majormate.friend.repository.FriendshipRepository;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FriendService")
class FriendServiceTest {

    @Mock
    FriendshipRepository friendshipRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    StudyStatusProvider studyStatusProvider;

    @InjectMocks
    FriendService friendService;

    // ────────────────────────────────────────────────────────────────────────
    // 공통 픽스처
    // ────────────────────────────────────────────────────────────────────────

    private User buildUser(String friendCode) {
        return User.builder()
                .id(UUID.randomUUID())
                .email(friendCode.toLowerCase() + "@example.com")
                .nickname("유저_" + friendCode)
                .major("CS")
                .friendCode(friendCode)
                .build();
    }

    private Friendship buildFriendship(User requester, User addressee) {
        return Friendship.builder()
                .id(UUID.randomUUID())
                .requester(requester)
                .addressee(addressee)
                .build();
    }

    // ────────────────────────────────────────────────────────────────────────
    // getFriends
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getFriends 메서드는")
    class Describe_getFriends {

        @Nested
        @DisplayName("user 가 requester 인 Friendship 이 있으면")
        class Context_when_user_is_requester {

            @Test
            @DisplayName("addressee 를 friend 로 FriendResponse 목록을 반환한다")
            void it_returns_addressee_as_friend() {
                User user = buildUser("USERA000");
                User addressee = buildUser("USERB000");
                Friendship friendship = buildFriendship(user, addressee);

                given(friendshipRepository.findAllByUser(user)).willReturn(List.of(friendship));
                given(studyStatusProvider.getStatus(addressee.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(addressee.getId())).willReturn(null);

                List<FriendResponse> result = friendService.getFriends(user);

                assertThat(result).hasSize(1);
                assertThat(result.get(0).userId()).isEqualTo(addressee.getId());
                assertThat(result.get(0).nickname()).isEqualTo(addressee.getNickname());
            }
        }

        @Nested
        @DisplayName("user 가 addressee 인 Friendship 이 있으면")
        class Context_when_user_is_addressee {

            @Test
            @DisplayName("requester 를 friend 로 FriendResponse 목록을 반환한다")
            void it_returns_requester_as_friend() {
                User requester = buildUser("USERC000");
                User user = buildUser("USERD000");
                Friendship friendship = buildFriendship(requester, user);

                given(friendshipRepository.findAllByUser(user)).willReturn(List.of(friendship));
                given(studyStatusProvider.getStatus(requester.getId())).willReturn(FriendStatus.STUDYING);
                given(studyStatusProvider.getKeyword(requester.getId())).willReturn("알고리즘");

                List<FriendResponse> result = friendService.getFriends(user);

                assertThat(result).hasSize(1);
                assertThat(result.get(0).userId()).isEqualTo(requester.getId());
                assertThat(result.get(0).status()).isEqualTo(FriendStatus.STUDYING);
                assertThat(result.get(0).studyKeyword()).isEqualTo("알고리즘");
            }
        }

        @Nested
        @DisplayName("친구가 없으면")
        class Context_with_no_friends {

            @Test
            @DisplayName("빈 목록을 반환한다")
            void it_returns_empty_list() {
                User user = buildUser("EMPTYU00");
                given(friendshipRepository.findAllByUser(user)).willReturn(List.of());

                List<FriendResponse> result = friendService.getFriends(user);

                assertThat(result).isEmpty();
            }
        }

        @Nested
        @DisplayName("requester 와 addressee 가 혼재된 Friendship 들이 있으면")
        class Context_with_mixed_friendships {

            @Test
            @DisplayName("각 Friendship 의 반대편 유저를 정확하게 friend 로 매핑한다")
            void it_correctly_maps_friend_for_each_friendship() {
                User user = buildUser("USERE000");
                User friendA = buildUser("FRIENDA0");
                User friendB = buildUser("FRIENDB0");

                Friendship asRequester = buildFriendship(user, friendA);
                Friendship asAddressee = buildFriendship(friendB, user);

                given(friendshipRepository.findAllByUser(user)).willReturn(List.of(asRequester, asAddressee));
                given(studyStatusProvider.getStatus(friendA.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(friendA.getId())).willReturn(null);
                given(studyStatusProvider.getStatus(friendB.getId())).willReturn(FriendStatus.PAUSED);
                given(studyStatusProvider.getKeyword(friendB.getId())).willReturn(null);

                List<FriendResponse> result = friendService.getFriends(user);

                assertThat(result).hasSize(2);
                assertThat(result).extracting(FriendResponse::userId)
                        .containsExactlyInAnyOrder(friendA.getId(), friendB.getId());
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // addFriend
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addFriend 메서드는")
    class Describe_addFriend {

        @Nested
        @DisplayName("존재하지 않는 친구 코드가 들어오면")
        class Context_with_unknown_friend_code {

            @Test
            @DisplayName("EntityNotFoundException 을 던진다")
            void it_throws_entity_not_found_exception() {
                User user = buildUser("ABCD1234");
                given(userRepository.findByFriendCode("UNKNOWN0")).willReturn(Optional.empty());

                assertThatThrownBy(() -> friendService.addFriend(user, new AddFriendRequest("UNKNOWN0")))
                        .isInstanceOf(EntityNotFoundException.class)
                        .hasMessageContaining("존재하지 않는 친구 코드");

                verify(friendshipRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("자기 자신의 친구 코드로 요청하면")
        class Context_with_self_friend_code {

            @Test
            @DisplayName("IllegalArgumentException 을 던진다")
            void it_throws_illegal_argument_exception() {
                UUID id = UUID.randomUUID();
                User user = User.builder()
                        .id(id)
                        .email("self@example.com")
                        .nickname("셀프")
                        .friendCode("SELF1234")
                        .build();
                given(userRepository.findByFriendCode("SELF1234")).willReturn(Optional.of(user));

                assertThatThrownBy(() -> friendService.addFriend(user, new AddFriendRequest("SELF1234")))
                        .isInstanceOf(IllegalArgumentException.class)
                        .hasMessageContaining("자기 자신");

                verify(friendshipRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("requester → addressee 방향 Friendship 이 이미 존재하면")
        class Context_with_existing_friendship_requester_to_addressee {

            @Test
            @DisplayName("save 를 생략하고 FriendResponse 를 반환한다")
            void it_skips_save_and_returns_friend_response() {
                User user = buildUser("REQUSER0");
                User target = buildUser("ADDRUSER");

                given(userRepository.findByFriendCode("ADDRUSER")).willReturn(Optional.of(target));
                given(friendshipRepository.existsByRequesterAndAddressee(user, target)).willReturn(true);
                given(studyStatusProvider.getStatus(target.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(target.getId())).willReturn(null);

                FriendResponse response = friendService.addFriend(user, new AddFriendRequest("ADDRUSER"));

                verify(friendshipRepository, never()).save(any());
                assertThat(response.userId()).isEqualTo(target.getId());
            }
        }

        @Nested
        @DisplayName("addressee → requester 방향 Friendship 이 이미 존재하면")
        class Context_with_existing_friendship_addressee_to_requester {

            @Test
            @DisplayName("save 를 생략하고 FriendResponse 를 반환한다")
            void it_skips_save_when_reverse_friendship_exists() {
                User user = buildUser("REQUSER1");
                User target = buildUser("ADDRUSE1");

                given(userRepository.findByFriendCode("ADDRUSE1")).willReturn(Optional.of(target));
                given(friendshipRepository.existsByRequesterAndAddressee(user, target)).willReturn(false);
                given(friendshipRepository.existsByRequesterAndAddressee(target, user)).willReturn(true);
                given(studyStatusProvider.getStatus(target.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(target.getId())).willReturn(null);

                FriendResponse response = friendService.addFriend(user, new AddFriendRequest("ADDRUSE1"));

                verify(friendshipRepository, never()).save(any());
                assertThat(response.userId()).isEqualTo(target.getId());
            }
        }

        @Nested
        @DisplayName("정상적인 신규 친구 추가 요청이면")
        class Context_with_new_friend_request {

            @Test
            @DisplayName("Friendship 을 저장하고 FriendResponse 를 반환한다")
            void it_saves_friendship_and_returns_friend_response() {
                User user = buildUser("REQUSER2");
                User target = buildUser("ADDRUSE2");

                given(userRepository.findByFriendCode("ADDRUSE2")).willReturn(Optional.of(target));
                given(friendshipRepository.existsByRequesterAndAddressee(user, target)).willReturn(false);
                given(friendshipRepository.existsByRequesterAndAddressee(target, user)).willReturn(false);
                given(friendshipRepository.save(any(Friendship.class))).willReturn(
                        buildFriendship(user, target)
                );
                given(studyStatusProvider.getStatus(target.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(target.getId())).willReturn(null);

                FriendResponse response = friendService.addFriend(user, new AddFriendRequest("ADDRUSE2"));

                verify(friendshipRepository).save(any(Friendship.class));
                assertThat(response.userId()).isEqualTo(target.getId());
                assertThat(response.nickname()).isEqualTo(target.getNickname());
                assertThat(response.major()).isEqualTo(target.getMajor());
            }
        }

        @Nested
        @DisplayName("신규 친구 추가 시 저장되는 Friendship 의 방향이")
        class Context_friendship_direction {

            @Test
            @DisplayName("requester=user, addressee=target 으로 저장된다")
            void it_saves_friendship_with_correct_direction() {
                User user = buildUser("REQUSER3");
                User target = buildUser("ADDRUSE3");

                given(userRepository.findByFriendCode("ADDRUSE3")).willReturn(Optional.of(target));
                given(friendshipRepository.existsByRequesterAndAddressee(user, target)).willReturn(false);
                given(friendshipRepository.existsByRequesterAndAddressee(target, user)).willReturn(false);
                given(studyStatusProvider.getStatus(target.getId())).willReturn(FriendStatus.OFFLINE);
                given(studyStatusProvider.getKeyword(target.getId())).willReturn(null);

                var captor = org.mockito.ArgumentCaptor.forClass(Friendship.class);
                given(friendshipRepository.save(captor.capture())).willAnswer(inv -> inv.getArgument(0));

                friendService.addFriend(user, new AddFriendRequest("ADDRUSE3"));

                Friendship saved = captor.getValue();
                assertThat(saved.getRequester().getId()).isEqualTo(user.getId());
                assertThat(saved.getAddressee().getId()).isEqualTo(target.getId());
            }
        }
    }
}
