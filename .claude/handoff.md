# Session Handoff — Phase 1 진행 상태

## 완료된 작업

### Phase 1 — Task 1: API 명세 구성 (Swagger/OpenAPI) ✅
- `docs/api/openapi.json` 생성 (Auth, User, Character, Friend, Room, Session, Stats 7개 도메인 전체 Contract 작성)
- `build.gradle`에 `springdoc-openapi-starter-webmvc-ui:3.0.3` 추가
- `application.yaml`에 springdoc 설정 추가 (`/swagger-ui.html`, `/api-docs`)

### Phase 1 — Task 2: 백엔드 기반 인프라 셋업 (부분 완료)
- 패키지 구조 생성: `auth`, `user`, `character`, `friend`, `room`, `stopwatch`, `stats`, `common` (각각 controller/service/repository/domain/dto 하위 구조)
- `application.yaml` — PostgreSQL, Redis, Google OAuth2 설정 완성 (환경변수 기반)
- `docker-compose.yml` 생성 (postgres:16, redis:7-alpine)
- `src/main/resources/db/migration/V1__init_users.sql` — users 테이블 초기 스키마
- `build.gradle`에 `flyway-core`, `flyway-database-postgresql` 추가
- `User.java`, `Gender.java`, `UserRepository.java` 생성
- `GoogleOAuth2UserService.java`, `AuthController.java`, `SecurityConfig.java`, `OAuth2Provider.java` 생성
- `./gradlew clean compileJava` → **BUILD SUCCESSFUL** ✅

## 남은 작업 (다음 세션에서 이어서)

### Phase 1 마무리
- [ ] Docker Desktop 실행 → `docker compose up -d` → `./gradlew bootRun` 확인
  - Docker Desktop이 꺼져 있어서 DB 기동 미완료
  - bootRun 성공 + `/swagger-ui.html` 접근 확인되면 Phase 1 완료
- [ ] `implementation_plan.md` Phase 1 체크박스 `[x]` 처리

### 다음 Phase
- Phase 2: 사용자 프로필 & 캐릭터 시스템

## 새 디렉토리 구조 안내
```
majormate/
├── majormate-server/   ← 이 프로젝트
└── majormate-app/      ← React Native (신규)
```
Claude Code를 `majormate/` 에서 열면 `majormate-server/CLAUDE.md` 참조 필요.
루트에 `majormate/CLAUDE.md` 를 새로 만들어두는 걸 권장.
