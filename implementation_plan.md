# MajorMate 초기 개발 로드맵 및 구현 계획 (Implementation Plan)

PRD.md에 파악된 철학과 핵심 기술 스택을 바탕으로 백엔드와 프론트엔드의 병렬 개발 로드맵을 수립했습니다. 모든 기능 개발은 Contract-First 원칙을 가장 최우선으로 진행하게 됩니다.

## User Review Required

> [!IMPORTANT]
> 계획서 내용을 읽어 보시고 제안된 로드맵 및 단계적 개발 순서에 동의하시면 'OK' 혹은 '승인'이라고 답변해 주십시오.
> 승인이 확인되면 Phase 1부터 Claude Code에게 구체적인 작업 지시를 시작할 계획입니다.

## Proposed Changes

---

### Phase 1: 기반 설정 및 API 명세 최우선 작업 (Contract-First)
- [x] **API 명세 구성 (Swagger/OpenAPI)**
  - Auth, Profile, Room 핵심 도메인에 대한 1차 API 명세 확정 및 /docs/api/ 경로에 openapi.json 파일 생성.
  - 프론트엔드 측 작업 병행을 위한 API 인터페이스 자동 생성 환경 셋업 가이드 구성.
- [x] **백엔드 기반 인프라 셋업**
  - Java 21 + Spring Boot 4.0.5 기반 디렉터리 폴더링 구성. ✅
  - PostgreSQL 및 Redis 로컬 개발 환경 연결 가이드. ✅ (docker-compose.yml 생성)
  - Google OAuth 2.0 Auth 기초 설정 뼈대 작성. ✅

---

### Phase 2: 사용자 프로필 & 캐릭터 시스템
- [x] **백엔드 작업 지시**
  - 국적, 전공, 닉네임, 성별 등 기본 사용자 메타 정보 업데이트 API 구현.
  - 캐릭터 레이어를 담당하는 정보(Base > Bottom > Top > Shoes > Hair > Accessories) 6가지 카테고리에 대한 DB Schema 및 DTO 설계 로직 개발.
  - `CharacterItem` 엔티티(아이템 종류, 이름, ID, 가격, 파일 경로 등) 설계 및 관리자(Admin) 전용 아이템 업로드/관리 API(POST/PUT/DELETE) 구현.
- [x] **프론트엔드 작업 지시**
  - 레이어 순서를 엄격히 준수한 렌더링 엔진 작성. ./assets/characters/ 하위 경로를 기준으로 한 이미지 로더 구현.
  - Google Stitch 2.0 기반의 회원 가입 및 캐릭터 설정 화면 구축.

---

### Phase 2.5: 에셋 서빙 — CloudFront URL 통합
- [x] **백엔드 작업 지시**
  - `application.yaml`에 `asset.base-url` 프로퍼티 추가 (`${ASSET_BASE_URL:https://cdn.majormate.com}`).
  - `AssetUrlService` 구현: S3 키 경로(상대 경로)를 CloudFront 전체 URL로 변환.
  - `CharacterService.getCharacter()` 에서 각 레이어 경로(bottom, top, shoes, hair 등)를 CloudFront URL로 변환하여 응답.
  - `CharacterItemService`의 아이템 목록/생성/수정 응답의 `filePath`도 CloudFront URL로 변환하여 반환.
  - **설계 원칙**: DB/관리자 입력은 S3 키 경로(상대 경로)로 저장, 응답 시에만 base-url prefix 적용.
- [x] **프론트엔드 작업 지시**
  - 캐릭터 렌더링 엔진을 로컬 `require('./assets/characters/...')` 방식에서 **서버 API가 반환하는 CloudFront URL 기반 원격 이미지 로딩**으로 교체.
  - `Image source={{ uri: url }}` 방식으로 변경하고, `url`이 `null`인 경우(미장착) 해당 레이어 렌더링을 건너뜀.
  - 원격 이미지 로딩 중 로딩 상태(스켈레톤 또는 fade-in) 처리 추가.
  - 아이템 상점 화면의 아이템 썸네일도 동일하게 CloudFront URL 사용으로 전환.

---

### Phase 3: 친구 추가 시스템 및 네트워킹
- [x] **백엔드 작업 지시**
  - 사용자별 고유 Friend Code를 발급하고, 추가 및 조회가 가능한 API 엔드포인트 마련.
  - 지인 기반 맞춤형 친구 그룹 시스템 구축 (추후 Redis 연동을 대비한 모듈 분리).
- [x] **프론트엔드 작업 지시**
  - 내 친구 목록 및 현재 학습 상태 (Offline/Studying) 표시되는 상태 대시보드 리스트 구현.

---

### Phase 4: 코어 기능 - 실시간 스톱워치 (전공방 & 커스텀 방)
- [x] **백엔드 작업 지시**
  - WebSocket + STOMP를 활용하여 실시간 Study Room(전공방/커스텀방) 입장 및 세션 관리 구현.
  - 스톱워치 시작/일시정지(Stop)/종료(End) 시그널 송수신 로직 구현:
    - **시작**: 공부 키워드 + 질문받기 허용 여부 수신, 세션 시작, Redis에 시작 시각·키워드·허용 여부 기록, 같은 방 멤버에게 상태 브로드캐스트, 친구들에게 FCM 알림 발송.
    - **키워드 변경**: 공부 중 키워드 업데이트 시그널 수신, Redis의 키워드 값 갱신, 방 멤버에게 변경 내용 브로드캐스트.
    - **일시정지(Stop)**: 타이머 중단, 누적 경과 시간 Redis에 저장 (세션은 유지), 방 멤버에게 상태 업데이트 브로드캐스트.
    - **종료(End)**: 총 누적 시간을 DB(`study_sessions`)에 최종 기록, 세션 종료, 방 멤버에게 퇴장 브로드캐스트.
  - 그룹 목록 구독 시 각 멤버의 **현재 키워드 + 경과 시간**을 실시간으로 전달하는 STOMP 토픽 설계.
- [x] **프론트엔드 작업 지시**
  - ~~사전 설정 모달~~ → START 버튼 탭 시 즉시 타이머 시작 (사용자 요청으로 모달 생략).
  - 스톱워치 UI 구동: START → [STOP | END] 버튼으로 교체 (stop_button.png, end_button.png 에셋 사용), 경과 시간 실시간 표시.
  - 그룹(전공방 1개 + 커스텀방 N개) 목록 패널 구현. 방 입장 시 3열 그리드로 멤버 닉네임·타이머·키워드 표시. 질문받기 허용 유저 💬 아이콘 구분.
  - TODO(Phase 5): 공부 시작 시 캐릭터 장착 악세서리(노트북/커피) 모션 연출 — `index.tsx` 주석으로 마킹 완료.

---

### Phase 5: 알림 & 질문 채팅 & 통계 (FCM, Q&A Chat, Statistics)
- [x] **백엔드 작업 지시**
  - FCM 디바이스 토큰 저장/갱신 API 구현 (`POST /api/users/me/fcm-token`).
  - FCM 푸시 알림 발송 로직 구현 (Firebase Admin SDK):
    - 친구가 공부 시작 → 해당 유저의 모든 친구에게 "OOO님이 공부를 시작했어요!" 알림 발송.
    - 질문 요청 수신 → 질문받는 사용자에게 "OOO님이 질문 요청을 보냈어요!" 알림 발송.
    - 질문 채팅방 메시지 수신 → 상대방에게 새 메시지 알림 발송.
  - 질문 채팅(Q&A) API 및 WebSocket 메시징 구현:
    - `POST /api/qa/request` — 질문 요청 전송 (질문받기 허용 유저에게만 가능).
    - `POST /api/qa/{requestId}/accept` — 수락 → 1:1 채팅방 생성 및 채팅방 ID 반환.
    - `POST /api/qa/{requestId}/reject` — 거절 → 요청자에게 거절 알림.
    - WebSocket 채팅 메시지 송수신 및 채팅 내역 DB(`chat_messages`) 저장.
  - 주별/월별 학습 시간 통계 및 키워드 추출 API 엔드포인트 구현.
- [x] **프론트엔드 작업 지시**
  - FCM 디바이스 토큰 획득(Expo Notifications) 및 서버 등록 처리.
  - 푸시 알림 수신 시 딥링크 라우팅 처리 (질문 채팅방 / 친구 목록).
  - 그룹 목록에서 질문받기 허용 유저 선택 시 질문 요청 전송 UI 제공.
  - 질문 요청 수락/거절 알림 수신 및 수락 시 1:1 채팅방 화면으로 자동 전환.
  - 통계 데이터 시각화 차트(진척도 파악용)를 Dashboard 형태로 노출.

> **✅ Android 빌드 오류 해결 완료**
>
> **원인**: `expo-linking@55.x`, `expo-splash-screen@55.x` (SDK 55 패키지)가 잘못 설치되어 `expo-constants@55.x`가 혼입됨. `expo@54.x`는 `expo-constants@18.x`를 요구하는데 버전 불일치로 Kotlin 컴파일 실패.
>
> **해결**:
> - `gradle-wrapper.properties`: `gradle-8.13-bin.zip` (AGP 최소 요구사항 충족)
> - `package.json`: `expo-linking ~8.0.11`, `expo-splash-screen ~31.0.13` (SDK 54 호환 버전)
> - `AndroidManifest.xml`: `android:name`을 `.MainApplication` → `me.majormate.app.MainApplication` 전체 경로로 수정 (namespace `com.majormate` ≠ package `me.majormate.app` 불일치)
> - `npm install --legacy-peer-deps` 후 빌드 성공, 기기(SM_S931N) 설치 확인

> **🔧 미해결: Google 소셜 로그인 검증 (다음 세션에서 이어서 진행)**
>
> 앱 설치 후 Google 로그인 버튼 클릭 시 "액세스 차단됨: 이 앱의 요청이 잘못되었습니다" 오류 발생.
>
> **조치 완료**: Google Cloud Console → Android OAuth 클라이언트(`310034142126-d0l9tssbtourqr4mhsqfjthg2mngc8ji`)에 패키지명 `com.majormate`, SHA-1 `9B:5E:30:1C:1C:68:EE:85:29:89:1F:31:F3:EF:F0:2A:B6:06:55:DB` 저장함 (반영까지 수 분 소요).
>
> **조치 완료 (2026-04-27)**:
> - **근본 원인**: `android/app/debug.keystore`(SHA-1: `5E:8F:16...`)가 Google Cloud Console에 등록된 시스템 keystore(SHA-1: `9B:5E:30...`)와 달랐음.
> - `android/app/build.gradle` signing config를 `System.getProperty("user.home") + "/.android/debug.keystore"` (시스템 keystore)로 수정.
> - Spring Security `SecurityConfig`에 `SessionCreationPolicy.STATELESS` + `HttpStatusEntryPoint(401)` 추가 → OAuth2 302 리다이렉트 제거.
> - `MobileGoogleAuthService`를 `idToken` 우선 검증 (tokeninfo API) / `accessToken` 폴백으로 개선.
> - 앱을 새 서명으로 재빌드·설치 (`adb uninstall` → `adb install`).
> - 서버 가동: `./gradlew bootRun --args='--spring.profiles.active=local'`
> - Metro 가동: `npx expo start --port 8081`

---

### Phase 5.5: 홈 화면 UI 개선 & 아이템 API 구현

#### 완료된 작업

- [x] **홈 화면 버튼 픽셀 디자인 교체** (`app/(tabs)/index.tsx`)
  - START / STOP / END PNG 이미지 버튼 → `PixelButton` 컴포넌트로 교체
  - 픽셀 그림자 효과 (4px 오프셋, 어두운 테두리), PressStart2P 폰트 레이블
  - 색상: START/RESUME=네온 라임(`#B8FF00`), STOP=앰버(`#F4A261`), END=레드(`#E05252`)
  - END 버튼 고정 너비(`width: 96`)로 RESUME 텍스트 잘림 해결
  - `controlRow` 항상 렌더링으로 idle↔running 전환 시 레이아웃 이동(shift) 제거

- [x] **탭 바 픽셀 도트 아이콘** (`app/(tabs)/_layout.tsx`)
  - 이모지 → View 그리드 기반 픽셀 아트 아이콘 (HOME: 5×5 집, CHAT: 5×5 말풍선, STATS: 5×4 막대차트)
  - PressStart2P 7px 탭 레이블, 네온 라임 활성 컬러
  - Android 시스템 내비게이션 바 safe area 처리 (`height: 64 + insets.bottom`)
  - QA → **CHAT** 탭 이름 변경, CHAT 화면 타이틀 `QA INBOX` → `CHAT ROOMS`

- [x] **캐릭터 영역 정보 표시** (`app/(tabs)/index.tsx`)
  - `/api/users/me` 호출로 닉네임·전공·성별 패치 (캐릭터 fetch는 `/api/users/me/character` 유지)
  - 캐릭터 바로 아래 닉네임(흰색 9px), 그 아래 `#전공  #성별` 해시태그(회색 7px) 표시
  - fetch 실패 시 `---` / `#???  #unknown` placeholder로 폴백
  - `characterArea`에 `paddingTop: 60` 적용으로 전체 캐릭터 영역 하단 이동

#### 미완료 — 다음 세션에서 이어서 진행

- [ ] **서버: 아이템 API 구현** (`majormate-server/`)
  - `Item` 엔티티 (`me.majormate.character.domain`): `id(UUID)`, `category(String)`, `name`, `price(int)`, `filePath(String)`
  - `ItemRepository`: `findAllByOrderByCategoryAscNameAsc()`
  - `ItemController`: `GET /api/items` — 인증 불필요, 전체 아이템 목록 반환
  - Response DTO: `ItemResponse(id, category, name, price, filePath)`
  - Security 설정: `/api/items` permitAll 추가
  - `DataInitializer` 빈: 아이템 0개일 때만 시드 실행 (멱등성)
  - 정적 파일 서빙: `majormate-app/assets/characters/` → `WebMvcConfigurer` 리소스 핸들러로 `/assets/characters/**` 경로 서빙
  - `filePath` 형식: `http://localhost:8082/assets/characters/{category}/{filename}`
  - 시드 데이터는 `assets/characters/` 실제 PNG 파일 목록 기반으로 생성

- [ ] **앱: 캐릭터 셋업 연동 확인** (`app/character-setup.tsx`)
  - `/api/items` 응답으로 아이템 썸네일이 정상 표시되는지 확인
  - 아이템 선택 → PUT `/api/users/me/character` → 홈 화면 캐릭터 반영까지 E2E 검증

---

### Phase 6: 그룹 초대 시스템 (Room 도메인 확장)

#### 개요

기존 `Room` 도메인을 확장해 초대 기반 커스텀 방 생성 및 멤버십 관리를 추가한다. 별도 도메인 없이 `type` 컬럼으로 MAJOR(전공 기본방) / CUSTOM(초대 방)을 구분하며, `RoomInvitation` 테이블만 신규 추가한다.

**MAJOR vs CUSTOM 구분**
- `MAJOR`: 같은 전공 사용자가 온보딩 완료 시 자동 가입. 탈퇴 불가. 전공명이 방 이름.
- `CUSTOM`: 생성자가 친구를 초대해 구성. 초대 수락 시에만 입장 가능.

---

- [ ] **백엔드 작업 지시**

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

---

- [ ] **프론트엔드 작업 지시**

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

---

### Phase 7: 수익화 (Monetization)

> Phase 6 완료 후 착수.

- [ ] **백엔드 작업 지시**
  - 사용자 포인트(Point) 관리 엔티티 및 보유량 조회/업데이트 API 구현.
  - 인앱 결제(IAP)를 통한 포인트 충전 비즈니스 로직 및 영수증 검증 Webhook 수신 엔드포인트 구현 (1000원: 1000P, 5000원: 5500P, 10000원: 12000P).
  - 사용자 아이템 소유권(보유 여부) 관리 엔티티 구현 및 아이템 구매 API 개발 (잔여 포인트 확인, 차감 및 소유권 부여 트랜잭션).
- [ ] **프론트엔드 작업 지시**
  - 홈 화면의 내 캐릭터 터치 시 '캐릭터 커스텀 화면'으로 이동하는 라우팅 추가.
  - 캐릭터 커스텀 화면 상단에 현재 보유 포인트(Point) 표시 및 포인트 충전소 진입 버튼/모달 구현 (포인트 충전 패키지 3종 제공).
  - 아이템 상점/인벤토리 렌더링 시 내가 가지지 못한(미보유) 아이템에 대해 약간의 블러 처리 및 자물쇠 아이콘(도트/픽셀 스타일) 노출.
  - 자물쇠가 있는 아이템 클릭 시 아이템 이미지, 이름, 가격이 표시되는 구매 확인 팝업 모달 노출 및 결제(포인트 차감) 플로우 연결.
  - 아이템 구매 완료 시 즉시 장착 처리되며, 착용된 아이템에는 체크 표시가 뜨고 캐릭터 렌더링에 실시간 반영.

---

## Open Questions

> [!WARNING]
> 현재 로드맵에서 1차 목표인 코어 기능에 집중하기 위해 도입되는 포인트 결제 시스템은 Phase 6 이후의 최우선 작업으로 진행될 예정입니다. MVP 수준에서의 앱 내 경제 시스템(인앱 결제 및 포인트 차감)이 이 구조로 충분한지 확인을 요청드립니다.

## Verification Plan

### Test & QA
- **오류 분석 기반 문서화**: 각 Phase 마다 생성되는 관련 에러 로그, 실행 상태 등은 백테스트 후 .claude/evidence/ 내역을 통해 투명하게 검증합니다. 통과 시 walkthrough.md에 요약하여 기록합니다.
- **백엔드 검증**: Swagger 페이지를 띄우고 DTO 구조와 API 반환 값이 Contract와 정확히 일치하는지 먼저 검토합니다.
- **프론트엔드 레이어 검증**: 캐릭터 레이어가 Base부터 Accessories까지 엄격하게 순서대로 쌓이는지 확인할 시각 자료(또는 구조 검사)를 지시 목록에 포함시킵니다.
