# Phase 5.5: 홈 화면 UI 개선 & 아이템 API 구현

## 완료된 작업

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

- [x] **서버: 아이템 API 구현** (`majormate-server/`)
  - `Item` 엔티티 (`me.majormate.character.domain`): `id(UUID)`, `category(String)`, `name`, `price(int)`, `filePath(String)`
  - `ItemRepository`: `findAllByOrderByCategoryAscNameAsc()`
  - `ItemController`: `GET /api/items` — 인증 불필요, 전체 아이템 목록 반환
  - Response DTO: `ItemResponse(id, category, name, price, filePath)`
  - Security 설정: `/api/items` permitAll 추가
  - `DataInitializer` 빈: 아이템 0개일 때만 시드 실행 (멱등성)
  - 정적 파일 서빙: `majormate-app/assets/characters/` → `WebMvcConfigurer` 리소스 핸들러로 `/assets/characters/**` 경로 서빙
  - `filePath` 형식: `http://localhost:8082/assets/characters/{category}/{filename}`
  - 시드 데이터는 `assets/characters/` 실제 PNG 파일 목록 기반으로 생성

- [x] **앱: 캐릭터 셋업 연동 확인** (`app/character-setup.tsx`)
  - `/api/items` 응답으로 아이템 썸네일이 정상 표시되는지 확인
  - 아이템 선택 → PUT `/api/users/me/character` → 홈 화면 캐릭터 반영까지 E2E 검증
