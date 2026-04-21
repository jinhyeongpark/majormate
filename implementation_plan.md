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
- [ ] **백엔드 기반 인프라 셋업** ← 컴파일 완료, bootRun 미확인 (Docker Desktop 기동 후 진행)
  - Java 21 + Spring Boot 4.0.5 기반 디렉터리 폴더링 구성. ✅
  - PostgreSQL 및 Redis 로컬 개발 환경 연결 가이드. ✅ (docker-compose.yml 생성)
  - Google OAuth 2.0 Auth 기초 설정 뼈대 작성. ✅

---

### Phase 2: 사용자 프로필 & 캐릭터 시스템
- [ ] **백엔드 작업 지시**
  - 국적, 전공, 닉네임, 성별 등 기본 사용자 메타 정보 업데이트 API 구현.
  - 캐릭터 레이어를 담당하는 정보(Base > Bottom > Top > Shoes > Hair > Accessories) 6가지 카테고리에 대한 DB Schema 및 DTO 설계 로직 개발.
- [ ] **프론트엔드 작업 지시**
  - 레이어 순서를 엄격히 준수한 렌더링 엔진 작성. ./assets/characters/ 하위 경로를 기준으로 한 이미지 로더 구현.
  - Google Stitch 2.0 기반의 회원 가입 및 캐릭터 설정 화면 구축.

---

### Phase 3: 친구 추가 시스템 및 네트워킹
- [ ] **백엔드 작업 지시**
  - 사용자별 고유 Friend Code를 발급하고, 추가 및 조회가 가능한 API 엔드포인트 마련.
  - 지인 기반 맞춤형 친구 그룹 시스템 구축 (추후 Redis 연동을 대비한 모듈 분리).
- [ ] **프론트엔드 작업 지시**
  - 내 친구 목록 및 현재 학습 상태 (Offline/Studying) 표시되는 상태 대시보드 리스트 구현.

---

### Phase 4: 코어 기능 - 실시간 스톱워치 (전공방 & 커스텀 방)
- [ ] **백엔드 작업 지시**
  - WebSocket + STOMP를 활용하여 실시간 Study Room(전공방/커스텀방) 입장 및 세션 관리 구현.
  - 스톱워치 시작/종료 시그널 송수신 로직 및 학습 누적 시간 기록(DB) 및 실시간 동기화(Redis).
- [ ] **프론트엔드 작업 지시**
  - 스톱워치 UI 구동 및 "공부 키워드" + "질문 받기 허용" 입력 폼 제공.
  - 공부 시작 시 캐릭터가 장착된 악세서리(노트북, 커피 등)를 들고 공부하는 상호작용 모션 연출 구현.

---

### Phase 5: 실시간 인터랙티브 통신 & 통계 (Statistics)
- [ ] **백엔드 작업 지시**
  - 질문 허용 사용자 대상의 인스타 라이브형 댓글 오버레이 WebSocket 메시징 발행(Publish) 로직.
  - 주별/월별 학습 시간 통계 및 키워드 추출 API 엔드포인트 구현.
- [ ] **프론트엔드 작업 지시**
  - 질문 도착 시 띄워지는 알림 팝업 오버레이 및 채팅 화면 전환 UI.
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
