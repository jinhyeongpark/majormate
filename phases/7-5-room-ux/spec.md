# Phase 7.5: 방(Room) UX 개선 & 스톱워치 서버 동기화

## 완료된 작업

- [x] **버그 수정: rooms.ts 인증 문제**
  - `src/api/rooms.ts`의 모든 함수가 raw `fetch` + `credentials: 'include'`(쿠키 방식)를 사용해 JWT 인증이 되지 않아 항상 빈 방 목록 반환.
  - 전체 함수를 `apiClient`(Bearer 토큰 자동 첨부) 기반으로 교체. `fetchMyRooms`, `fetchRoom`, `joinRoom`, `leaveRoom`, `createRoom`, `createCustomRoom`, `inviteToRoom`, `fetchReceivedInvitations`, `acceptInvitation`, `declineInvitation` 전부 수정.

- [x] **전공방 이름 형식 변경** — `{한국어 전공명} Study Room` → `{영어 전공명} Room`
  - `MajorRepository`에 `findByNameKo` 추가.
  - `RoomService.getOrCreateMajorRoom()` 에서 `nameEn + " Room"` 형태로 방 이름 생성.
  - `V14__rename_major_rooms.sql` 마이그레이션으로 기존 MAJOR 방 이름 일괄 업데이트 (`rooms JOIN majors ON major = name_ko`).

- [x] **방 화면 풀스크린 전환**
  - 방 클릭 시 오버레이 패널 → 전체화면 라우트(`app/room/[roomId].tsx`) 전환으로 변경.
  - `_layout.tsx`에 `room/[roomId]` Stack 라우트 등록.
  - `RoomsPanel`에서 `onEnterRoom` prop 제거, `router.push('/room/${room.id}')` 직접 호출.
  - `index.tsx`에서 `'room'` 패널 상태 및 `currentRoom` 관련 코드 제거.
  - 멤버 카드 레이아웃: 시간(위) → 아바타(중) → 닉네임(아래). MAJOR 방은 LEAVE 버튼 숨김.

- [x] **스톱워치 서버 동기화**
  - `StopwatchRestController` 신규: `POST /api/stopwatch/start|pause|resume|end` (JWT Bearer 인증).
  - `start`에서 `roomId: null` 시 서버가 유저의 전공방으로 자동 해석.
  - `StopwatchController.resolve()` — `OAuth2AuthenticationToken` 하드캐스팅 → JWT(`UsernamePasswordAuthenticationToken`) 도 처리하도록 수정.
  - 앱 `useStopwatch` 훅: START/PAUSE/RESUME/END 각각 서버 REST 호출 추가 (fire-and-forget).
  - 방 화면 폴링 30초 → 5초로 단축.

- [x] **방 멤버 캐릭터 표시 (Map 캐시)**
  - `GET /api/users/{userId}/character` 신규 엔드포인트 (다른 유저 캐릭터 조회).
  - `UserService.getById(UUID)` 추가.
  - 앱 방 화면: `useRef<Map<string, CharacterLayers>>` 캐시 — 처음 등장한 userId만 `fetchUserCharacter()` 호출, 이후 5초 폴링에서 재요청 없음.
  - 캐릭터 존재 시 `CharacterRenderer size={60}`, 없으면 원형 이니셜 placeholder fallback.

- [x] **방 화면 캐릭터 렌더링 버그 수정**
  - `FlatList extraData={tick}` → `extraData={[tick, characters]}` 로 수정. `characters` Map 업데이트 시 즉시 리렌더되지 않던 문제 해결.
  - `CharacterRenderer size={60}` → `size={80}` 으로 확대.
