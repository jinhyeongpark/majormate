# Phase 8.1: 스토어 상품 등록 (수동 작업)

> ⏸ 수동 개입 구간 — 개발자 계정 및 외부 서비스 설정 필요.
> Phase 8.2, 8.3은 이 Phase 완료 후 착수.

## 태스크

- [ ] **Google Play Console**
  - 앱 등록 및 패키지명(`com.majormate`) 확인.
  - 인앱 상품 생성 (관리형 제품):
    - `points_1000` — 1,000원
    - `points_5000` — 5,000원
    - `points_10000` — 10,000원
  - Google Play Developer API 활성화 → 서비스 계정 생성 → JSON 키 파일 발급.
  - 서비스 계정에 Google Play Console 재무 데이터 접근 권한 부여.

- [ ] **App Store Connect**
  - 앱 등록 및 번들 ID 확인.
  - 인앱 구매 상품 생성 (소모성):
    - `points_1000` — ₩1,000 (Tier 1)
    - `points_5000` — ₩5,000 (Tier 5)
    - `points_10000` — ₩10,000 (Tier 10)
  - App Store Connect API 키 발급 (Issuer ID, Key ID, `.p8` 파일).
  - App Store Server Notifications v2 Webhook URL 등록: `POST /api/points/iap/webhook` 서버 주소.
