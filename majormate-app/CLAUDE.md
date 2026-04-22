# majormate-app

React Native (Expo) 클라이언트. 이 디렉터리에서 Claude를 열면 이 파일이 기본 컨텍스트가 된다.

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
| 상태 관리 | Zustand (도입 예정) |
| API 클라이언트 | axios, `src/api/` 에 도메인별로 분리 (도입 예정) |
| 스타일 | StyleSheet (NativeWind 사용 안 함) |
| 언어 | TypeScript ~5.8 |

## 디렉터리 구조

```
app/              # Expo Router 라우트 (화면 단위)
components/       # 공통 컴포넌트
assets/           # 이미지, 폰트 등 정적 리소스
constants/        # 공통 상수
src/              # 비즈니스 로직 (점진적으로 이전)
  api/            # 도메인별 API 클라이언트
  config/env.ts   # 환경변수 및 base URL
```

## 컴포넌트 규칙

- `app/` — Expo Router 라우트. 화면 레이아웃과 네비게이션만 담당
- `components/` — 재사용 공통 컴포넌트
- Props 타입은 반드시 TypeScript `interface`로 정의

## API 연동

- base URL은 `src/config/env.ts` 참고
- 인증 토큰은 axios interceptor로 처리 (`src/api/client.ts`)
- 에러 처리는 공통 에러 핸들러 사용

## 참고 문서

- PRD: `../PRD.md` — 전체 기능 명세 및 UX 플로우
- 로드맵: `../implementation_plan.md` — 페이즈별 태스크 목록
- API 명세: `../majormate-server/docs/api/openapi.json`
