# majormate-app — 앱 서브에이전트 컨텍스트

React Native (Expo) 클라이언트. CTO 에이전트가 앱 작업을 위임할 때 이 파일이 컨텍스트로 사용된다.

> **서브에이전트 완료 조건**: 작업 완료 후 반드시 결과를 요약해 CTO에게 반환한다.  
> 반환 내용: 생성·수정된 파일 목록, 새 화면·컴포넌트, API 연동 내용.

## 커맨드

```bash
npm start          # Expo dev server 시작
npm run android    # Android 에뮬레이터 실행
npm run ios        # iOS 시뮬레이터 실행
```

## 기술 스택

| 관심사 | 기술 |
|---|---|
| 프레임워크 | React Native 0.79, Expo ~53 |
| 라우팅 | Expo Router ~4 (파일 기반, `app/` 디렉터리) |
| 상태 관리 | Zustand |
| API 클라이언트 | axios, `src/api/` 에 도메인별로 분리 |
| 스타일 | StyleSheet (NativeWind 사용 안 함) |
| 언어 | TypeScript ~5.8 |

## 디렉터리 구조

```
app/              # Expo Router 라우트 (화면 단위)
components/       # 공통 컴포넌트
assets/           # 이미지, 폰트 등 정적 리소스
constants/        # 공통 상수
src/
  api/            # 도메인별 API 클라이언트
  auth/           # 인증 토큰 관리
  config/env.ts   # 환경변수 및 base URL
```

## 컴포넌트 규칙

- `app/` — Expo Router 라우트. 화면 레이아웃과 네비게이션만 담당
- `components/` — 재사용 공통 컴포넌트
- Props 타입은 반드시 TypeScript `interface`로 정의

## API 연동

- base URL: `src/config/env.ts`
- 인증 토큰: axios interceptor (`src/api/client.ts`)
- 에러 처리: 공통 에러 핸들러 사용

## UI 작업 레퍼런스 규칙

새로운 화면(screen) UI 작업을 시작하기 전에 **반드시 디자인 레퍼런스 이미지를 요청**한다.

요청 포맷:
```
📎 레퍼런스 요청: <화면 이름> 화면 작업을 시작합니다.
디자인 레퍼런스 이미지가 있으면 파일 경로 또는 이미지를 붙여넣어 주세요.
없으면 "없음"이라고 알려주시면 바로 진행합니다.
```

- 이미지는 파일 경로(Read 툴)나 채팅창 붙여넣기 방식 모두 가능
- 사용자가 "없음" 또는 생략 의사를 밝히면 레퍼런스 없이 진행

## 참고 문서

- PRD: `../PRD.md` — 전체 기능 명세 및 UX 플로우
- 로드맵: `../implementation_plan.md` — 페이즈별 태스크 목록
- API 명세: `../majormate-server/docs/api/openapi.json`
