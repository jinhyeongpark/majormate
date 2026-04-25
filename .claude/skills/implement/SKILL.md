---
name: implement
description: This skill should be used when the user wants to work through an implementation plan file (e.g. implementation_plan.md). It reads the plan, tracks progress via checkboxes, executes tasks phase by phase via CTO sub-agent dispatch, and marks tasks complete as work finishes. Invokable as /implement or /implement [phase number].
---

# Implement Skill

`implementation_plan.md`를 페이즈 단위로 실행하는 CTO 워크플로.  
각 태스크를 서버/앱으로 분류해 해당 서브에이전트에게 디스패치하고, 완료 후 체크박스를 업데이트한다.

## Invocation Forms

- `/implement` — 전체 진행률 대시보드 출력 후 페이즈 선택 요청
- `/implement <N>` — Phase N 바로 시작 (예: `/implement 2`)
- `/implement <N>.<M>` — Phase N의 M번째 태스크부터 시작 (예: `/implement 2.1`)

## Step 1 — 플랜 파일 탐색

아래 순서로 플랜 파일을 찾는다:

1. 인수로 전달된 경로 (예: `/implement my_plan.md`)
2. 프로젝트 루트의 `implementation_plan.md`
3. 프로젝트 루트의 `*plan*.md` 또는 `*roadmap*.md`

플랜 파일이 없으면 사용자에게 경로를 요청한다.

## Step 2 — 진행 상태 파싱

플랜 파일을 읽어 추출한다:

- 모든 페이즈 (예: `### Phase 1: ...`)
- 각 페이즈의 태스크 (`- [ ]` = 미완료, `- [x]` = 완료)
- `## Verification Plan` 등 검증 섹션

## Step 3 — 진행률 대시보드 (인수 없이 호출 시)

```
Phase 1: 기반 설정 및 API 명세  [2/3 done]  ⬛⬛⬜
Phase 2: 프로필 & 캐릭터        [0/2 done]  ⬜⬜
Phase 3: 친구 시스템            [0/2 done]  ⬜⬜
...
```

출력 후: "어떤 Phase부터 진행할까요? (번호 입력)"

## Step 4 — 의존성 확인

Phase N 시작 전 이전 페이즈에 미완료 태스크가 있으면 경고한다:

> ⚠️ Phase N-1에 미완료 태스크가 있습니다. 건너뛰면 통합 오류가 발생할 수 있습니다. 계속할까요? (y/n)

## Step 5 — 태스크 분류 및 서브에이전트 디스패치

각 미완료 태스크에 대해:

### 5-1. 분류

태스크 설명을 보고 작업 대상을 결정한다:

| 키워드 / 내용 | 디스패치 대상 |
|---|---|
| API, 엔드포인트, DB, 마이그레이션, 엔티티, 서비스, 레포지토리, Spring, JWT | Server Agent |
| 화면, 컴포넌트, UI, 앱, Expo, React Native, 스타일, 연동 | App Agent |
| 둘 다 포함 (예: "로그인 기능 — 서버 API + 앱 화면") | 풀스택 (Server → App 순서) |

### 5-2. 착수 선언

```
▶ 태스크 N.M: <태스크 설명>
   → 서버 에이전트 / 앱 에이전트 / 풀스택 디스패치
```

### 5-3. 서버 에이전트 디스패치 (해당 시)

Agent tool로 `server` 에이전트를 호출한다. 프롬프트에 포함할 내용:

- 구현할 태스크 (구체적으로)
- `implementation_plan.md`의 관련 명세
- **Contract-first**: API 엔드포인트가 포함된 태스크는 openapi.json 업데이트를 먼저 요청
- 반환 요청: 생성·수정된 파일 목록, 새 API 엔드포인트 및 DTO 스키마

### 5-4. 앱 에이전트 디스패치 (해당 시)

서버 디스패치가 먼저 완료된 경우 API 계약을 앱 에이전트에 전달한다.  
Agent tool로 `app` 에이전트를 호출한다. 프롬프트에 포함할 내용:

- 구현할 태스크 (구체적으로)
- 서버 에이전트가 반환한 API 엔드포인트·DTO 스키마 (풀스택 태스크인 경우)
- 반환 요청: 생성·수정된 파일 목록

### 5-5. 검증

서브에이전트 완료 후:
- 서버: `./gradlew build` 또는 관련 테스트 통과 여부 확인 요청
- 앱: TypeScript 타입 오류 없음 확인 요청
- 플랜의 `Verification Plan` 섹션에 명시된 조건이 있으면 해당 조건도 확인

### 5-6. 체크박스 업데이트

작업이 검증될 때만 `- [ ]` → `- [x]`로 업데이트한다.  
파일 포매팅을 변경하지 않고 해당 줄만 수정한다.

## Step 6 — 페이즈 완료 보고

```
✅ Phase N 완료 — X개 태스크 완료
서버: <변경 사항 요약>
앱:   <변경 사항 요약>

다음: Phase N+1 (<제목>). 바로 시작할까요? (y/n)
```

## 컨벤션

- 태스크 `[x]` 표시는 실제 작업이 완료·검증된 후에만 한다.
- 서브태스크(들여쓰기 항목)가 있으면 모두 완료 후 부모를 `[x]`로 표시한다.
- 시크릿·자격증명이 필요한 시점에는 즉시 중단하고 수동 개입 포맷으로 PM에게 보고한다.
- 풀스택 태스크는 반드시 서버 → 앱 순서로 실행한다.

## References

- `references/plan_parsing.md` — 플랜 파일 파싱 규칙 및 엣지 케이스
