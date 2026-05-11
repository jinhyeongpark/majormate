# Phase 7.8: 어드민 콘텐츠 관리

## 개요

어드민 전용 콘텐츠 관리 기능 추가. 아이템 PNG 이미지 업로드를 통한 캐릭터 아이템 등록 API 구현 및 온보딩 아바타 생성 시 선택 가능한 스타터 아이템 구분값 추가.

## 배경

기존 `CharacterItemDataInitializer`가 로컬 PNG 파일 기반으로 아이템을 시드해왔으나, 앱 assets의 PNG 파일을 삭제함에 따라 시드 방식 폐기. 어드민이 직접 이미지를 업로드해 아이템을 등록하는 방식으로 전환.

## 완료된 작업

### 정리 작업 (사전)
- [x] `CharacterItemDataInitializer.java` 삭제 — 로컬 PNG 시드 방식 폐기
- [x] `WebMvcConfig.java` 삭제 — 앱 assets 디렉터리 정적 서빙 제거 (PNG 파일 삭제됨)
- [x] V15 마이그레이션 — `user_items`, `character_items` 전체 레코드 삭제

### 백엔드
- [x] V16 마이그레이션 — `character_items.is_starter` 컬럼 추가 (BOOLEAN NOT NULL DEFAULT FALSE), 박진형 계정 role → ADMIN
- [x] `CharacterItem` 엔티티 — `isStarter` 필드 추가 (`@Builder.Default false`)
- [x] `CharacterItemResponse` DTO — `isStarter` 필드 추가
- [x] `JwtPrincipal` — DB의 `UserRole`을 읽어 `ROLE_ADMIN` 또는 `ROLE_USER` 동적 부여
- [x] `JwtAuthenticationFilter` — 사용자 role DB 조회 후 JwtPrincipal에 전달
- [x] `WebMvcConfig` 재생성 — `./uploads/` 디렉터리를 `/assets/characters/**`로 서빙
- [x] `SecurityConfig` — `/api/admin/**` ADMIN 역할 제한 추가
- [x] `application.yaml` — `upload.dir: ${UPLOAD_DIR:./uploads}` 추가
- [x] `AdminItemService` — 파일 업로드 + DB 저장 서비스 (TDD 적용, 테스트: `AdminItemServiceTest`)
- [x] `AdminItemController` — `POST /api/admin/items` (multipart/form-data)

## API

| Method | Path | 권한 | 설명 |
|---|---|---|---|
| `POST` | `/api/admin/items` | ADMIN | 아이템 등록 |

**Request** `multipart/form-data`:
- `file` (binary) — 512×512 PNG 이미지
- `name` (string) — 아이템 이름
- `price` (int) — 가격 (음수 → 0 보정)
- `category` (ItemCategory) — HAIR / TOP / BOTTOM / SHOES / BAG / GLASSES / ITEM
- `isStarter` (boolean, default=false) — 온보딩 아바타 생성 시 선택 가능 여부

**Response 201**: `CharacterItemResponse { id, category, name, price, filePath, owned, isStarter }`

## 이미지 저장

- 저장 경로: `./uploads/assets/characters/{category}/{UUID}_{originalFilename}`
- 서빙 URL: `http://localhost:8082/assets/characters/{category}/{UUID}_{filename}`
- 프로덕션: `UPLOAD_DIR`, `ASSET_BASE_URL` 환경변수로 재정의

## TODO

- [ ] S3 업로드 연동 — 프로덕션 배포 전 Phase 8 또는 별도 phase에서 진행
