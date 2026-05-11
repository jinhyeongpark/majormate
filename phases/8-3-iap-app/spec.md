# Phase 8.3: 앱 — IAP 라이브러리 교체

> Phase 8.1 완료 후 착수 (서버 Phase 8.2와 병렬 진행 가능).

## 태스크

- [ ] **프론트엔드 작업 지시**
  - `react-native-iap` 설치 및 네이티브 설정 (Android: `build.gradle` billing 의존성, iOS: StoreKit 프레임워크 링크).
  - `components/TopUpModal.tsx` 스텁 코드 교체:
    - `RNIap.initConnection()` → `RNIap.requestPurchase(productId)` → `purchaseUpdatedListener`에서 영수증(`receiptData` 또는 JWS) 수신.
    - 영수증 수신 후 서버 `POST /api/points/iap/webhook`으로 전달 → 성공 시 `RNIap.finishTransaction()` 호출.
    - 네트워크 오류 시 영수증을 로컬 저장(`AsyncStorage`) 후 다음 앱 실행 시 재처리.
  - 결제 복원(`RNIap.getAvailablePurchases()`) 기능 추가 — 앱 재설치 후 구매 복원 지원.
