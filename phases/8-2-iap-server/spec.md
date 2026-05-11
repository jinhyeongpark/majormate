# Phase 8.2: 서버 — 영수증 검증 실제 구현

> Phase 8.1 완료 후 착수. 스토어 자격증명 필요.

## 태스크

- [ ] **백엔드 작업 지시**
  - `application-secret.yaml`에 스토어 자격증명 추가:
    - `google.play.service-account-key-path` (JSON 키 파일 경로)
    - `apple.appstore.issuer-id`, `apple.appstore.key-id`, `apple.appstore.private-key` (`.p8` 내용)
  - `UserPointService.validateReceipt()` 실제 구현:
    - **Android**: Google Play Developer API `purchases.products.get` 호출 → `purchaseState == 0` (완료) 검증 → 중복 처리 방지 (`orderId` 기록).
    - **iOS**: App Store Server API `POST /inApps/v1/verifyReceipt` 호출 → `status == 0` 검증 → `transactionId` 기록으로 중복 방지.
  - `IapTransaction` 엔티티 추가: `orderId/transactionId`, `productId`, `userId`, `processedAt` — 중복 충전 방지용 유니크 제약.
  - App Store Server Notifications v2 수신 처리: `POST /api/points/iap/webhook` 엔드포인트를 Apple JWS 페이로드 파싱 방식으로 확장.

## Open Questions

> MVP 수준에서의 앱 내 경제 시스템(인앱 결제 및 포인트 차감)이 현재 구조로 충분한지 확인 필요.
> 1차 목표인 코어 기능에 집중하기 위해 포인트 결제 시스템은 Phase 6 이후 최우선 작업으로 진행 예정.
