# Phase 6.5: 프로필 모달 & 로그아웃 (UI 개선)

## 개요

홈 화면에서 닉네임을 탭하면 프로필 모달이 열리고, LOGOUT 버튼으로 앱에서 로그아웃할 수 있다.

## 완료된 작업

- [x] **프론트엔드 — ProfileModal 구현 완료**
  - `components/ProfileModal.tsx` 신규 작성. `absoluteFill` View 기반 오버레이 (Android Modal 터치 버그 회피).
  - LOGOUT / CLOSE 버튼 구현. `gender` 프롭 제거, `#major` 태그만 표시.
  - `app/(tabs)/index.tsx`에서 닉네임 탭 → `profileVisible` 상태로 열기.

- [x] **기타 홈 화면 개선 완료**
  - 홈 화면 전공명 영문 표기 (`MajorSearchInput.handleSelect` → `major.nameEn` 저장).
  - 성별 태그 제거 (영문 전공명이 길어 UI 혼잡).
  - `app/(tabs)/index.tsx` 데이터 로딩 버그 수정: `fetch + credentials:include` → `apiClient.get()` (Bearer 토큰 인터셉터 사용).
  - `app/onboarding.tsx` 동일 버그 수정.

- [x] **로그아웃 기능 수정 완료**

## 로그아웃 버그 이력 (해결 완료)

**증상**: LOGOUT 버튼 탭 시 `Alert("로그아웃 시작")` Alert이 뜨는 것 확인 → `handleLogout` 함수 진입은 정상.
`router.replace('/')` 호출 직후 "Uncaught" 에러 발생 → 화면 전환 실패. 앱을 완전히 재시작하면 로그아웃된 상태이지만, 버튼 탭만으로는 전환이 안 됨.

**원인 분석**: `app/index.tsx`에 `useEffect(() => { tokenStorage.get().then(token => { if (token) router.replace('/(tabs)') }) }, [])` 가 있었음.
로그아웃 시 `router.replace('/')` 로 login 화면이 마운트되는 도중 위 effect가 발화 → AsyncStorage에서 stale 토큰을 읽어 `router.replace('/(tabs)')` 역방향 호출 → React Navigation Invariant Violation 충돌.

**시도한 것들**:
- `_layout.tsx`에 `useSegments` 기반 반응형 auth 가드 추가 → 로그아웃 후 즉시 `/(tabs)` 재이동 발생해 제거.
- `ProfileModal`을 `<Modal>` → `absoluteFill View` 로 교체 (Android 터치 이슈).
- `app/index.tsx` useEffect 제거 + `_layout.tsx` 단일 토큰 체크로 이동.
- `router.replace('/')` 대신 `router.navigate('/')` 또는 `router.dismissAll()` 사용 시도.
- `setTimeout(() => router.replace('/'), 0)` 으로 현재 이벤트 루프 이후 전환 시도.
- Expo Router `<Redirect>` 컴포넌트를 상태 기반으로 사용하는 방식으로 전환.
- `tokenStorage.remove()` 완료 후 Zustand/Context 전역 auth 상태를 `null`로 변경 → `_layout.tsx`에서 해당 상태를 watch해 `router.replace('/')` 호출.
