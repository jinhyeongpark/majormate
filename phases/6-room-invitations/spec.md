# Phase 6: 그룹 초대 시스템 (Room 도메인 확장)

## 개요

기존 `Room` 도메인을 확장해 초대 기반 커스텀 방 생성 및 멤버십 관리를 추가한다. 별도 도메인 없이 `type` 컬럼으로 MAJOR(전공 기본방) / CUSTOM(초대 방)을 구분하며, `RoomInvitation` 테이블만 신규 추가한다.

**MAJOR vs CUSTOM 구분**
- `MAJOR`: 같은 전공 사용자가 온보딩 완료 시 자동 가입. 탈퇴 불가. 전공명이 방 이름.
- `CUSTOM`: 생성자가 친구를 초대해 구성. 초대 수락 시에만 입장 가능.

## 태스크

- [x] **백엔드 작업 지시**

  **스키마 변경**
  - `rooms` 테이블: `created_by(userId)` 컬럼 추가 (CUSTOM 방 생성자 추적용).
  - `RoomInvitation` 테이블 신규: `id`, `room_id`, `inviter_id`, `invitee_id`, `status(PENDING | ACCEPTED | DECLINED | EXPIRED)`, `created_at`, `expired_at`.

  **온보딩 자동 가입 로직**
  - `PATCH /api/users/me` (전공 설정) 완료 시, 해당 전공의 MAJOR 방이 없으면 생성 후 가입. 있으면 바로 가입.

  **신규 API 엔드포인트**

  | Method | Path | 설명 |
  |---|---|---|
  | `POST` | `/api/rooms/{roomId}/invitations` | 기존 방에 추가 초대 |
  | `DELETE` | `/api/rooms/{roomId}/leave` | 방 탈퇴 (MAJOR 방은 403 반환) |
  | `GET` | `/api/rooms/invitations/received` | 받은 초대 목록 (PENDING) |
  | `POST` | `/api/rooms/invitations/{invitationId}/accept` | 초대 수락 → `room_members` 추가 |
  | `POST` | `/api/rooms/invitations/{invitationId}/decline` | 초대 거절 |

  **기존 엔드포인트 변경**
  - `GET /api/rooms` — `type` 필터 없이 호출 시 **내가 속한 방 전체** 반환으로 동작 변경 (기존: 전체 목록).
  - `POST /api/rooms` body에 `inviteeUserIds: List<String>` 필드 추가. CUSTOM 방 생성 시 즉시 초대 발송.

  **요청/응답 DTO**

  ```
  POST /api/rooms (CUSTOM 생성)
    Request:  { name, type: "CUSTOM", major, maxMembers, inviteeUserIds: List<String> }
    Response: RoomSummary

  GET /api/rooms (내 방 목록)
    Response: List<RoomSummary>
      RoomSummary 기존 필드 + { createdByMe: boolean }

  GET /api/rooms/invitations/received
    Response: List<RoomInvitation>
      RoomInvitation { id, roomId, roomName, inviterNickname, createdAt }
  ```

  **비즈니스 규칙**
  - 초대는 친구 관계인 사용자에게만 발송 가능.
  - 초대 만료: 7일. 만료 전환 스케줄러 추가 (`@Scheduled`).
  - MAJOR 방 탈퇴 요청 시 403 반환.
  - 생성자(`createdBy`)만 추가 초대 가능 (MVP).

  **Phase 5 연동**
  - 초대 발송 시 FCM 알림: `"OOO님이 [방 이름]에 초대했어요!"` → Phase 5 FCM 완료 후 연동.

- [x] **프론트엔드 작업 지시**

  **`src/api/rooms.ts` 확장**
  - 기존 `rooms.ts`에 타입 및 함수 추가.
  - 추가 타입: `RoomInvitation { id, roomId, roomName, inviterNickname, createdAt }`.
  - 추가 함수: `createCustomRoom`, `inviteToRoom`, `leaveRoom`, `fetchReceivedInvitations`, `acceptInvitation`, `declineInvitation`.

  **`components/RoomsPanel.tsx` UI 재설계**
  - 상단 고정: 내 전공 MAJOR 방 1개 (배지로 "전공" 표시, 탈퇴 버튼 없음).
  - 하단 스크롤: 내 CUSTOM 방 목록 (memberCount 표시).
  - 우상단 `+` 버튼 → `CreateRoomModal` 열기.
  - 상단 탭: "내 방" / "받은 초대" 전환 (미확인 초대 건수 뱃지).

  **`components/CreateRoomModal.tsx` 신규 작성**
  - 방 이름 `TextInput`.
  - 친구 목록(`fetchFriends()`) 다중 선택 (체크박스 방식).
  - 선택된 친구 칩(chip) 미리보기.
  - "만들기" 버튼 → `createCustomRoom()` 호출 → 성공 시 패널 리프레시.

  **`components/RoomInvitationsView.tsx` 신규 작성**
  - `fetchReceivedInvitations()` 마운트 시 fetch.
  - 초대 카드: 방 이름, 초대한 친구 닉네임, 수락/거절 버튼.
  - 수락 → 방 목록 즉시 리프레시.

  **`app/(tabs)/index.tsx` 수정**
  - `RoomsPanel`에 새 props 전달 구조 반영 (패널 탭 상태 등).
