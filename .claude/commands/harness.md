이 프로젝트는 Harness 프레임워크를 사용한다. `implementation_plan.md`를 기반으로 step 파일을 설계하고 `execute.py`로 자동 실행한다.

---

## 호출 형식

- `/harness` — 진행률 대시보드 출력 후 phase 선택
- `/harness <N>` — Phase N 바로 step 설계 시작 (예: `/harness 8`)

---

## 워크플로우

### A. 탐색

아래 파일들을 읽고 프로젝트 맥락을 파악한다:

- `implementation_plan.md` — 전체 페이즈·태스크 목록 및 체크박스 상태
- `docs/PRD.md` — 기획·UX 의도
- `majormate-server/CLAUDE.md` — 서버 패키지 구조·컨벤션
- `majormate-app/CLAUDE.md` — 앱 구조·컨벤션
- `phases/index.json` — 이미 실행된 harness phase 현황 (존재하는 경우)

### B. 진행률 대시보드 (인수 없이 호출 시)

`implementation_plan.md`의 체크박스와 `phases/index.json`을 읽어 현황을 출력한다:

```
Phase 7: 수익화              [3/4 done]  ⬛⬛⬛⬜   phases/7-monetization: completed
Phase 8: 소셜 기능           [0/3 done]  ⬜⬜⬜     phases/8-social: pending
Phase 9: 통계 고도화         [0/2 done]  ⬜⬜       (미설계)
```

출력 후: "어떤 Phase를 설계할까요? (번호 입력)"

### C. 논의

구현 전 기술적으로 결정해야 할 사항이 있으면 사용자에게 제시하고 논의한다. 질문은 1개씩만 한다.

### D. Step 설계

`implementation_plan.md`의 해당 Phase 태스크를 step으로 변환하는 초안을 작성해 피드백을 요청한다.

**태스크 → step 분류 규칙:**

| 태스크 내용 | step 구성 |
|---|---|
| DB 스키마 변경 | step 단독 (migration) |
| 서버 Service 레이어 | test-agent step + server-agent step으로 분리 |
| 서버 Controller만 | server-agent step 1개 |
| 앱 화면/컴포넌트 | app-agent step 1개 |
| 풀스택 | server step → app step 순서 |

**TDD 적용 원칙**: Service 레이어 구현이 포함된 태스크는 반드시 `test-agent` step을 먼저 만든다.

**설계 원칙:**

1. **Scope 최소화** — 하나의 step에서 하나의 레이어 또는 에이전트만 다룬다.
2. **자기완결성** — 각 step 파일은 독립된 Claude 세션에서 실행된다. 필요한 정보는 전부 파일 안에 적는다.
3. **사전 준비 강제** — 이전 step에서 생성/수정된 파일 경로를 명시해 맥락을 이어받도록 유도한다.
4. **시그니처 수준 지시** — 인터페이스만 제시하고 구현체는 에이전트 재량에 맡긴다. 핵심 규칙은 명시한다.
5. **AC는 실행 가능한 커맨드** — 추상적 서술 금지. 실제 명령어를 포함한다.
6. **주의사항은 구체적으로** — "X를 하지 마라. 이유: Y" 형식.
7. **네이밍** — kebab-case slug (예: `db-migration`, `point-service-test`, `point-service-impl`).

### E. 파일 생성

사용자가 승인하면 아래 파일들을 생성한다.

#### E-1. `phases/index.json`

이미 존재하면 `phases` 배열에 새 항목만 추가한다.

```json
{
  "phases": [
    {
      "dir": "8-social",
      "status": "pending"
    }
  ]
}
```

#### E-2. `phases/{phase-name}/index.json`

```json
{
  "project": "MajorMate",
  "phase": "<phase-name>",
  "steps": [
    { "step": 0, "name": "db-migration", "status": "pending" },
    { "step": 1, "name": "point-service-test", "status": "pending" },
    { "step": 2, "name": "point-service-impl", "status": "pending" },
    { "step": 3, "name": "point-controller", "status": "pending" },
    { "step": 4, "name": "app-shop-screen", "status": "pending" }
  ]
}
```

상태 전이 규칙:

| 전이 | 기록 필드 | 기록 주체 |
|---|---|---|
| → `completed` | `completed_at`, `summary` | Claude (summary), execute.py (timestamp) |
| → `error` | `failed_at`, `error_message` | Claude (message), execute.py (timestamp) |
| → `blocked` | `blocked_at`, `blocked_reason` | Claude (reason), execute.py (timestamp) |

#### E-3. `phases/{phase-name}/step{N}.md`

**서비스 테스트 step 템플릿** (`test-agent` 호출):

```markdown
# Step {N}: {name} (서비스 테스트 작성)

## 읽어야 할 파일

- `CLAUDE.md`
- `majormate-server/CLAUDE.md`
- `implementation_plan.md` — Phase {N} 관련 태스크
- {이전 step에서 생성된 도메인/DTO 파일}

## 작업

`.claude/agents/test.md`에 정의된 **test agent**를 Agent tool로 호출하라.

전달할 내용:
- 테스트 대상 서비스: `{ServiceName}`
- 메서드 시그니처:
  ```java
  {메서드 시그니처}
  ```
- 비즈니스 룰:
  - {규칙 1}
  - {규칙 2}

test agent가 반환한 테스트 파일 경로를 다음 step을 위해 summary에 기록하라.

## Acceptance Criteria

```bash
cd majormate-server && ./gradlew test --tests "me.majormate.{domain}.service.{ServiceName}Test"
# 테스트가 컴파일되고 RED(실패)로 끝나야 한다
```

## 검증 절차

1. AC 커맨드를 실행해 테스트가 RED인지 확인한다.
2. `phases/{phase-name}/index.json` 해당 step 업데이트:
   - RED 확인 → `"status": "completed"`, `"summary": "테스트 파일 경로: {경로}, 커버 케이스: {목록}"`
   - 컴파일 실패 → `"status": "error"`, `"error_message": "{에러}"`

## 금지사항

- 구현 코드(서비스 메서드 바디)를 작성하지 마라. 이유: 다음 step에서 서버 에이전트가 담당한다.
- 테스트를 통과하도록 stub을 넣지 마라. 이유: RED여야 다음 step이 의미 있다.
```

**서비스 구현 step 템플릿** (`server-agent` 호출):

```markdown
# Step {N}: {name} (서비스 구현)

## 읽어야 할 파일

- `CLAUDE.md`
- `majormate-server/CLAUDE.md`
- {이전 test step에서 작성된 테스트 파일 경로}
- {관련 도메인/DTO/Repository 파일}

## 작업

`.claude/agents/server.md`에 정의된 **server agent**를 Agent tool로 호출하라.

전달할 내용:
- 구현할 서비스: `{ServiceName}`
- 테스트 파일(스펙): `{테스트 파일 경로}`
- 테스트를 GREEN으로 만드는 구현을 작성할 것
- 절대 하지 말 것: 테스트 바디 수정, `@Disabled` 추가

## Acceptance Criteria

```bash
cd majormate-server && ./gradlew test --tests "me.majormate.{domain}.service.{ServiceName}Test"
# 모든 테스트가 GREEN이어야 한다
```

## 검증 절차

1. AC 커맨드 실행 → GREEN 확인.
2. `implementation_plan.md`에서 해당 태스크 체크박스를 `- [x]`로 업데이트한다.
3. `phases/{phase-name}/index.json` 해당 step 업데이트:
   - GREEN → `"status": "completed"`, `"summary": "구현 파일: {경로}"`
   - 실패 → `"status": "error"`, `"error_message": "{에러}"`

## 금지사항

- 테스트 바디를 수정하지 마라. 이유: 테스트는 스펙이다.
- `@Disabled`나 `@Ignore`를 추가하지 마라.
```

**앱 step 템플릿** (`app-agent` 호출):

```markdown
# Step {N}: {name} (앱 구현)

## 읽어야 할 파일

- `CLAUDE.md`
- `majormate-app/CLAUDE.md`
- `docs/PRD.md` — 해당 화면 UX 명세
- {이전 server step의 API 엔드포인트·DTO 정보}

## 작업

`.claude/agents/app.md`에 정의된 **app agent**를 Agent tool로 호출하라.

전달할 내용:
- 구현할 화면/컴포넌트: `{설명}`
- API 계약:
  - `{HTTP_METHOD} {경로}` — 요청: `{DTO}`, 응답: `{DTO}`
- UX 요구사항: {PRD 관련 내용 요약}

## Acceptance Criteria

```bash
cd majormate-app && npx tsc --noEmit
# TypeScript 타입 에러 없음
```

## 검증 절차

1. AC 커맨드 실행 → 타입 에러 없음 확인.
2. `implementation_plan.md`에서 해당 태스크 체크박스를 `- [x]`로 업데이트한다.
3. `phases/{phase-name}/index.json` 해당 step 업데이트.

## 금지사항

- 서버 코드를 수정하지 마라. 이유: 이 step은 앱만 담당한다.
```

### F. 실행

```bash
python3 scripts/execute.py {phase-name}        # 순차 실행
python3 scripts/execute.py {phase-name} --push  # 실행 후 push
```

execute.py가 자동으로 처리하는 것:

- `feat-{phase-name}` 브랜치 생성/checkout
- 가드레일 주입 — `CLAUDE.md` + `PRD.md` 내용을 매 step 프롬프트에 포함
- 컨텍스트 누적 — 완료된 step의 `summary`를 다음 step 프롬프트에 전달
- 자가 교정 — 실패 시 최대 3회 재시도, 이전 에러를 프롬프트에 피드백
- 2단계 커밋 — 코드 변경(`feat`)과 메타데이터(`chore`) 분리 커밋

에러 복구:

- **error**: `index.json`에서 해당 step `status`를 `"pending"`으로 바꾸고 `error_message` 삭제 후 재실행.
- **blocked**: `blocked_reason`에 적힌 사유 해결 후 `status`를 `"pending"`으로 바꾸고 재실행.
