# Phase 5: 알림 & 질문 채팅 & 통계 (FCM, Q&A Chat, Statistics)

## 태스크

- [x] **백엔드 작업 지시**
  - FCM 디바이스 토큰 저장/갱신 API 구현 (`POST /api/users/me/fcm-token`).
  - FCM 푸시 알림 발송 로직 구현 (Firebase Admin SDK):
    - 친구가 공부 시작 → 해당 유저의 모든 친구에게 "OOO님이 공부를 시작했어요!" 알림 발송.
    - 질문 요청 수신 → 질문받는 사용자에게 "OOO님이 질문 요청을 보냈어요!" 알림 발송.
    - 질문 채팅방 메시지 수신 → 상대방에게 새 메시지 알림 발송.
  - 질문 채팅(Q&A) API 및 WebSocket 메시징 구현:
    - `POST /api/qa/request` — 질문 요청 전송 (질문받기 허용 유저에게만 가능).
    - `POST /api/qa/{requestId}/accept` — 수락 → 1:1 채팅방 생성 및 채팅방 ID 반환.
    - `POST /api/qa/{requestId}/reject` — 거절 → 요청자에게 거절 알림.
    - WebSocket 채팅 메시지 송수신 및 채팅 내역 DB(`chat_messages`) 저장.
  - 주별/월별 학습 시간 통계 및 키워드 추출 API 엔드포인트 구현.
- [x] **프론트엔드 작업 지시**
  - FCM 디바이스 토큰 획득(Expo Notifications) 및 서버 등록 처리.
  - 푸시 알림 수신 시 딥링크 라우팅 처리 (질문 채팅방 / 친구 목록).
  - 그룹 목록에서 질문받기 허용 유저 선택 시 질문 요청 전송 UI 제공.
  - 질문 요청 수락/거절 알림 수신 및 수락 시 1:1 채팅방 화면으로 자동 전환.
  - 통계 데이터 시각화 차트(진척도 파악용)를 Dashboard 형태로 노출.

## 완료 노트

### Android 빌드 오류 해결

**원인**: `expo-linking@55.x`, `expo-splash-screen@55.x` (SDK 55 패키지)가 잘못 설치되어 `expo-constants@55.x`가 혼입됨. `expo@54.x`는 `expo-constants@18.x`를 요구하는데 버전 불일치로 Kotlin 컴파일 실패.

**해결**:
- `gradle-wrapper.properties`: `gradle-8.13-bin.zip` (AGP 최소 요구사항 충족)
- `package.json`: `expo-linking ~8.0.11`, `expo-splash-screen ~31.0.13` (SDK 54 호환 버전)
- `AndroidManifest.xml`: `android:name`을 `.MainApplication` → `me.majormate.app.MainApplication` 전체 경로로 수정 (namespace `com.majormate` ≠ package `me.majormate.app` 불일치)
- `npm install --legacy-peer-deps` 후 빌드 성공, 기기(SM_S931N) 설치 확인

### Google 소셜 로그인 검증 (해결 완료 2026-04-27)

**증상**: 앱 설치 후 Google 로그인 버튼 클릭 시 "액세스 차단됨: 이 앱의 요청이 잘못되었습니다" 오류.

**근본 원인**: `android/app/debug.keystore`(SHA-1: `5E:8F:16...`)가 Google Cloud Console에 등록된 시스템 keystore(SHA-1: `9B:5E:30...`)와 달랐음.

**해결**:
- Google Cloud Console → Android OAuth 클라이언트(`310034142126-d0l9tssbtourqr4mhsqfjthg2mngc8ji`)에 패키지명 `com.majormate`, SHA-1 `9B:5E:30:1C:1C:68:EE:85:29:89:1F:31:F3:EF:F0:2A:B6:06:55:DB` 등록.
- `android/app/build.gradle` signing config를 `System.getProperty("user.home") + "/.android/debug.keystore"` (시스템 keystore)로 수정.
- Spring Security `SecurityConfig`에 `SessionCreationPolicy.STATELESS` + `HttpStatusEntryPoint(401)` 추가 → OAuth2 302 리다이렉트 제거.
- `MobileGoogleAuthService`를 `idToken` 우선 검증 (tokeninfo API) / `accessToken` 폴백으로 개선.
- 앱을 새 서명으로 재빌드·설치 (`adb uninstall` → `adb install`).
