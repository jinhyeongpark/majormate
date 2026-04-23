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
- [ ] **프론트엔드 작업 지시**
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
- [ ] **백엔드 작업 지시**
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
- [ ] **프론트엔드 작업 지시**
  - FCM 디바이스 토큰 획득(Expo Notifications) 및 서버 등록 처리.
  - 푸시 알림 수신 시 딥링크 라우팅 처리 (질문 채팅방 / 친구 목록).
  - 그룹 목록에서 질문받기 허용 유저 선택 시 질문 요청 전송 UI 제공.
  - 질문 요청 수락/거절 알림 수신 및 수락 시 1:1 채팅방 화면으로 자동 전환.
  - 통계 데이터 시각화 차트(진척도 파악용)를 Dashboard 형태로 노출.

---

## Open Questions

> [!WARNING]
> 현재 로드맵에서 1차 목표인 코어 기능에 집중하기 위해 PRD의 \4. Monetization (Income Model)\ 관련 추가 과제(결제 및 구독 적용)는 Phase 6 이후로 보류하려 합니다. 최소 기능 제품(MVP) 배포를 기준으로 이 방향성에 동의하시는지 확인을 요청드립니다.

## Verification Plan

### Test & QA
- **오류 분석 기반 문서화**: 각 Phase 마다 생성되는 관련 에러 로그, 실행 상태 등은 백테스트 후 .claude/evidence/ 내역을 통해 투명하게 검증합니다. 통과 시 walkthrough.md에 요약하여 기록합니다.
- **백엔드 검증**: Swagger 페이지를 띄우고 DTO 구조와 API 반환 값이 Contract와 정확히 일치하는지 먼저 검토합니다.
- **프론트엔드 레이어 검증**: 캐릭터 레이어가 Base부터 Accessories까지 엄격하게 순서대로 쌓이는지 확인할 시각 자료(또는 구조 검사)를 지시 목록에 포함시킵니다.
