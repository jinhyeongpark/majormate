# CLAUDE.md — MajorMate 모노레포

**MajorMate**는 전공 기반 글로벌 스터디 플랫폼. 실시간 학습 트래킹과 게임화 요소를 갖춘다.

> 서브 프로젝트 디렉터리에서 Claude를 열면 각 디렉터리의 `CLAUDE.md`가 적용된다.

## 서브 프로젝트

| 디렉터리 | 역할 | 상세 가이드 |
|---|---|---|
| `majormate-server/` | Spring Boot 백엔드 (Java 21, 포트 8082) | `majormate-server/CLAUDE.md` |
| `majormate-app/` | React Native (Expo) 클라이언트 | `majormate-app/CLAUDE.md` |

## 공유 참고 문서

- `PRD.md` — 전체 기능 명세, UX 플로우, 수익화 모델
- `implementation_plan.md` — 페이즈별 로드맵 및 태스크 목록

## 브랜치 정책

- **기본 작업 브랜치는 `dev`** — 모든 작업은 `dev`로 push하고 `main`에는 직접 push하지 않는다.
- `main` ← PR (dev) 방식으로만 병합.

## Git & Secrets 정책

- **시크릿 절대 커밋 금지.** 자격증명·API 키·토큰을 담는 파일은 생성 전에 `.gitignore` 적용 여부를 확인한다.
- 무조건 무시해야 하는 파일 유형: `.env`, `.env.*` (`.env.example` 제외), `application-local.yaml`, `application-secret.yaml`, `credentials.json`, `service-account*.json`, `*.secret`
- 새 시크릿 설정 파일 추가 시: `.gitignore` 먼저 수정 → 파일 생성 순서로 진행.
- OAuth·DB·클라우드 등 외부 연동 설정 시, `.env.example` 템플릿(플레이스홀더 값)만 제공하고 실제 값은 절대 커밋하지 않는다.

## 수동 개입 정책

사용자만 할 수 있는 작업이 필요할 때는 **반드시 멈추고 제안을 먼저 제시**한다. 자격증명을 추측하거나 우회하지 않는다.

멈춰야 하는 상황:
- **시크릿 / 자격증명** — Google OAuth Client ID/Secret, API 키, DB 비밀번호, JWT 시크릿, 클라우드 서비스 계정 키
- **외부 서비스 설정** — Google Cloud Console OAuth 리다이렉트 URI 등록, API 활성화, 클라우드 리소스 생성
- **수동 시작이 필요한 인프라** — Docker Desktop 미실행, VPN 필요 등
- **파괴적 스키마·데이터 마이그레이션** — 테이블·컬럼 삭제, 백업 없는 비가역적 마이그레이션
- **서드파티 계정 액션** — 이메일 발송, 소셜 플랫폼 포스팅, 앱스토어 배포

**중단 포맷:**
```
⏸ Manual step required: <한 줄 요약>

What to do:
1. <step>
2. <step>

완료 후 "계속" (또는 결과 설명)을 입력하면 이어서 진행합니다.
```
