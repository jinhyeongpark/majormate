package me.majormate.room.service;

import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.room.domain.Room;
import me.majormate.stopwatch.service.SessionStateService;
import me.majormate.room.domain.RoomType;
import me.majormate.room.dto.CreateRoomRequest;
import me.majormate.room.dto.RoomResponse;
import me.majormate.room.repository.RoomMemberRepository;
import me.majormate.room.repository.RoomRepository;
import me.majormate.user.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoomService")
class RoomServiceTest {

    @Mock
    RoomRepository roomRepository;

    @Mock
    RoomMemberRepository roomMemberRepository;

    @Mock
    SessionStateService sessionStateService;

    @Mock
    SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    RoomService roomService;

    // ────────────────────────────────────────────────────────────────────────
    // 공통 픽스처
    // ────────────────────────────────────────────────────────────────────────

    private User buildUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("host@example.com")
                .nickname("호스트")
                .major("CS")
                .friendCode("HOST1234")
                .build();
    }

    private Room buildRoom(UUID id, RoomType type, String major) {
        return Room.builder()
                .id(id)
                .name(major + " Study Room")
                .type(type)
                .major(major)
                .maxMembers(30)
                .build();
    }

    // ────────────────────────────────────────────────────────────────────────
    // getRooms
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getRooms 메서드는")
    class Describe_getRooms {

        @Nested
        @DisplayName("typeStr 가 null 이면")
        class Context_with_null_type {

            @Test
            @DisplayName("전체 방 목록을 반환한다")
            void it_returns_all_rooms() {
                Room r1 = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "CS");
                Room r2 = buildRoom(UUID.randomUUID(), RoomType.CUSTOM, "Math");
                given(roomRepository.findAll()).willReturn(List.of(r1, r2));
                given(roomMemberRepository.countByRoom(any())).willReturn(0);

                List<RoomResponse> result = roomService.getRooms(null, null);

                verify(roomRepository).findAll();
                verify(roomRepository, never()).findAllByType(any());
                verify(roomRepository, never()).findAllByTypeAndMajor(any(), any());
                assertThat(result).hasSize(2);
            }
        }

        @Nested
        @DisplayName("typeStr 는 있고 major 가 null 이면")
        class Context_with_type_only {

            @Test
            @DisplayName("타입으로만 필터링한 방 목록을 반환한다")
            void it_returns_rooms_filtered_by_type() {
                Room r1 = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "CS");
                given(roomRepository.findAllByType(RoomType.MAJOR)).willReturn(List.of(r1));
                given(roomMemberRepository.countByRoom(any())).willReturn(0);

                List<RoomResponse> result = roomService.getRooms("MAJOR", null);

                verify(roomRepository).findAllByType(RoomType.MAJOR);
                verify(roomRepository, never()).findAllByTypeAndMajor(any(), any());
                assertThat(result).hasSize(1);
            }
        }

        @Nested
        @DisplayName("typeStr 는 있고 major 가 공백 문자열이면")
        class Context_with_type_and_blank_major {

            @Test
            @DisplayName("타입으로만 필터링한 방 목록을 반환한다")
            void it_returns_rooms_filtered_by_type_when_major_is_blank() {
                Room r1 = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "CS");
                given(roomRepository.findAllByType(RoomType.MAJOR)).willReturn(List.of(r1));
                given(roomMemberRepository.countByRoom(any())).willReturn(0);

                List<RoomResponse> result = roomService.getRooms("MAJOR", "   ");

                verify(roomRepository).findAllByType(RoomType.MAJOR);
                verify(roomRepository, never()).findAllByTypeAndMajor(any(), any());
                assertThat(result).hasSize(1);
            }
        }

        @Nested
        @DisplayName("typeStr 와 major 가 모두 유효하면")
        class Context_with_type_and_major {

            @Test
            @DisplayName("타입과 전공으로 필터링한 방 목록을 반환한다")
            void it_returns_rooms_filtered_by_type_and_major() {
                Room r1 = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "CS");
                given(roomRepository.findAllByTypeAndMajor(RoomType.MAJOR, "CS")).willReturn(List.of(r1));
                given(roomMemberRepository.countByRoom(any())).willReturn(0);

                List<RoomResponse> result = roomService.getRooms("MAJOR", "CS");

                verify(roomRepository).findAllByTypeAndMajor(RoomType.MAJOR, "CS");
                verify(roomRepository, never()).findAllByType(any());
                assertThat(result).hasSize(1);
            }
        }

        @Nested
        @DisplayName("유효하지 않은 typeStr 가 주어지면")
        class Context_with_invalid_type {

            @Test
            @DisplayName("IllegalArgumentException 을 던진다")
            void it_throws_illegal_argument_exception() {
                assertThatThrownBy(() -> roomService.getRooms("INVALID", null))
                        .isInstanceOf(IllegalArgumentException.class);
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // createRoom
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createRoom 메서드는")
    class Describe_createRoom {

        @Nested
        @DisplayName("maxMembers 가 non-null 로 주어지면")
        class Context_with_explicit_max_members {

            @Test
            @DisplayName("해당 값을 maxMembers 로 사용한 Room 을 저장하고 RoomResponse 를 반환한다")
            void it_saves_room_with_given_max_members() {
                User host = buildUser();
                CreateRoomRequest req = new CreateRoomRequest("My Room", "CUSTOM", null, 10);

                Room savedRoom = Room.builder()
                        .id(UUID.randomUUID())
                        .name("My Room")
                        .type(RoomType.CUSTOM)
                        .maxMembers(10)
                        .host(host)
                        .build();

                given(roomRepository.save(any(Room.class))).willReturn(savedRoom);
                given(roomMemberRepository.save(any())).willReturn(null);
                given(roomMemberRepository.countByRoom(savedRoom)).willReturn(1);

                RoomResponse response = roomService.createRoom(host, req);

                verify(roomRepository).save(any(Room.class));
                verify(roomMemberRepository).save(any());
                assertThat(response.maxMembers()).isEqualTo(10);
            }
        }

        @Nested
        @DisplayName("maxMembers 가 null 이면")
        class Context_with_null_max_members {

            @Test
            @DisplayName("maxMembers 를 기본값 30 으로 설정하여 저장한다")
            void it_saves_room_with_default_max_members() {
                User host = buildUser();
                CreateRoomRequest req = new CreateRoomRequest("My Room", "CUSTOM", null, null);

                ArgumentCaptor<Room> roomCaptor = ArgumentCaptor.forClass(Room.class);

                Room savedRoom = Room.builder()
                        .id(UUID.randomUUID())
                        .name("My Room")
                        .type(RoomType.CUSTOM)
                        .maxMembers(30)
                        .host(host)
                        .build();

                given(roomRepository.save(any(Room.class))).willReturn(savedRoom);
                given(roomMemberRepository.save(any())).willReturn(null);
                given(roomMemberRepository.countByRoom(savedRoom)).willReturn(1);

                RoomResponse response = roomService.createRoom(host, req);

                verify(roomRepository).save(roomCaptor.capture());
                assertThat(roomCaptor.getValue().getMaxMembers()).isEqualTo(30);
                assertThat(response.maxMembers()).isEqualTo(30);
            }
        }

        @Nested
        @DisplayName("방 생성 시")
        class Context_room_member_side_effect {

            @Test
            @DisplayName("host 를 RoomMember 로 함께 저장한다")
            void it_saves_host_as_room_member() {
                User host = buildUser();
                CreateRoomRequest req = new CreateRoomRequest("My Room", "MAJOR", "CS", 20);

                Room savedRoom = Room.builder()
                        .id(UUID.randomUUID())
                        .name("My Room")
                        .type(RoomType.MAJOR)
                        .major("CS")
                        .maxMembers(20)
                        .host(host)
                        .build();

                given(roomRepository.save(any(Room.class))).willReturn(savedRoom);
                given(roomMemberRepository.save(any())).willReturn(null);
                given(roomMemberRepository.countByRoom(savedRoom)).willReturn(1);

                roomService.createRoom(host, req);

                verify(roomMemberRepository).save(any());
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // joinRoom
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("joinRoom 메서드는")
    class Describe_joinRoom {

        @Nested
        @DisplayName("존재하지 않는 roomId 가 주어지면")
        class Context_with_unknown_room_id {

            @Test
            @DisplayName("EntityNotFoundException 을 던진다")
            void it_throws_entity_not_found_exception() {
                UUID unknownId = UUID.randomUUID();
                given(roomRepository.findById(unknownId)).willReturn(Optional.empty());

                assertThatThrownBy(() -> roomService.joinRoom(buildUser(), unknownId))
                        .isInstanceOf(EntityNotFoundException.class);

                verify(roomMemberRepository, never()).save(any());
                verify(messagingTemplate, never()).convertAndSend(anyString(), Optional.ofNullable(any()));
            }
        }

        @Nested
        @DisplayName("이미 멤버인 유저가 입장하면")
        class Context_with_existing_member {

            @Test
            @DisplayName("RoomMember 저장과 브로드캐스트를 생략한다")
            void it_skips_save_and_broadcast() {
                User user = buildUser();
                UUID roomId = UUID.randomUUID();
                Room room = buildRoom(roomId, RoomType.CUSTOM, "CS");

                given(roomRepository.findById(roomId)).willReturn(Optional.of(room));
                given(roomMemberRepository.existsByRoomAndUser(room, user)).willReturn(true);

                roomService.joinRoom(user, roomId);

                verify(roomMemberRepository, never()).save(any());
                verify(messagingTemplate, never()).convertAndSend(anyString(), Optional.ofNullable(any()));
            }
        }

        @Nested
        @DisplayName("신규 입장 유저가 주어지면")
        class Context_with_new_member {

            @Test
            @DisplayName("RoomMember 를 저장하고 WebSocket 브로드캐스트를 한다")
            void it_saves_room_member_and_broadcasts() {
                User user = buildUser();
                UUID roomId = UUID.randomUUID();
                Room room = buildRoom(roomId, RoomType.CUSTOM, "CS");

                given(roomRepository.findById(roomId)).willReturn(Optional.of(room));
                given(roomMemberRepository.existsByRoomAndUser(room, user)).willReturn(false);

                roomService.joinRoom(user, roomId);

                verify(roomMemberRepository).save(any());
                verify(messagingTemplate).convertAndSend(
                        eq("/topic/room." + roomId),
                        any(Object.class)
                );
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // leaveRoom
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("leaveRoom 메서드는")
    class Describe_leaveRoom {

        @Nested
        @DisplayName("존재하지 않는 roomId 가 주어지면")
        class Context_with_unknown_room_id {

            @Test
            @DisplayName("EntityNotFoundException 을 던진다")
            void it_throws_entity_not_found_exception() {
                UUID unknownId = UUID.randomUUID();
                given(roomRepository.findById(unknownId)).willReturn(Optional.empty());

                assertThatThrownBy(() -> roomService.leaveRoom(buildUser(), unknownId))
                        .isInstanceOf(EntityNotFoundException.class);

                verify(roomMemberRepository, never()).deleteByRoomAndUser(any(), any());
                verify(messagingTemplate, never()).convertAndSend(anyString(), Optional.ofNullable(any()));
            }
        }

        @Nested
        @DisplayName("유효한 roomId 와 유저가 주어지면")
        class Context_with_valid_room_and_user {

            @Test
            @DisplayName("RoomMember 를 삭제하고 WebSocket 브로드캐스트를 한다")
            void it_deletes_member_and_broadcasts() {
                User user = buildUser();
                UUID roomId = UUID.randomUUID();
                Room room = buildRoom(roomId, RoomType.CUSTOM, "CS");

                given(roomRepository.findById(roomId)).willReturn(Optional.of(room));

                roomService.leaveRoom(user, roomId);

                verify(roomMemberRepository).deleteByRoomAndUser(room, user);
                verify(messagingTemplate).convertAndSend(
                        eq("/topic/room." + roomId),
                        any(Object.class)
                );
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // getOrCreateMajorRoom
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getOrCreateMajorRoom 메서드는")
    class Describe_getOrCreateMajorRoom {

        @Nested
        @DisplayName("MAJOR 타입 + major 값의 방이 이미 존재하면")
        class Context_with_existing_major_room {

            @Test
            @DisplayName("기존 Room 을 반환하고 save 를 호출하지 않는다")
            void it_returns_existing_room_without_save() {
                Room existing = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "CS");
                given(roomRepository.findByTypeAndMajor(RoomType.MAJOR, "CS"))
                        .willReturn(Optional.of(existing));

                Room result = roomService.getOrCreateMajorRoom("CS");

                assertThat(result).isSameAs(existing);
                verify(roomRepository, never()).save(any());
            }
        }

        @Nested
        @DisplayName("방이 존재하지 않으면")
        class Context_without_existing_major_room {

            @Test
            @DisplayName("새 MAJOR 방을 생성하고 roomRepository.save 를 호출한다")
            void it_creates_new_major_room_and_saves() {
                given(roomRepository.findByTypeAndMajor(RoomType.MAJOR, "Math"))
                        .willReturn(Optional.empty());

                Room newRoom = buildRoom(UUID.randomUUID(), RoomType.MAJOR, "Math");
                newRoom = Room.builder()
                        .id(UUID.randomUUID())
                        .name("Math Study Room")
                        .type(RoomType.MAJOR)
                        .major("Math")
                        .maxMembers(30)
                        .build();
                given(roomRepository.save(any(Room.class))).willReturn(newRoom);

                Room result = roomService.getOrCreateMajorRoom("Math");

                ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
                verify(roomRepository).save(captor.capture());
                assertThat(captor.getValue().getName()).isEqualTo("Math Study Room");
                assertThat(captor.getValue().getType()).isEqualTo(RoomType.MAJOR);
                assertThat(captor.getValue().getMajor()).isEqualTo("Math");
            }
        }
    }
}
