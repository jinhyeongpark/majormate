# 🚀 Project: MajorMate (Global Major-based Study Platform)

## 1. Project Philosophy & Background
* **The Problem:** * "왜 전공 공부와 외국어 공부를 따로 해야 할까? 동시에 할 수는 없을까?"
    * "나와 같은 길을 걷는 전공자들은 전 세계에서 지금 무엇을, 얼마나 공부하고 있을까?"
* **The Solution:** 전 세계 같은 전공생들을 실시간으로 연결하고, 학습 키워드 공유와 캐릭터 게이미피케이션을 통해 동기를 부여하는 글로벌 스터디 플랫폼.

---

## 2. Technical Stack

### 🔙 Back-end
* **Language/Framework:** Java 17, Spring Boot 3.3.0
* **Database:** PostgreSQL (Core Data), Redis (Real-time Status/Ranking)
* **Persistence:** Spring Data JPA, QueryDSL (Dynamic Queries)
* **Communication:** WebSocket + STOMP (Real-time Stopwatch & Motion Sync)
* **Auth:** Spring Security + Google OAuth 2.0

### 🔜 Front-end
* **Framework:** React Native (Expo)
* **Workflow:** AI-Native Development (Contract-First via Swagger/OpenAPI)
* **UI/UX:** Pixel Art 기반 게이미피케이션, Google Stitch 2.0 디자인 가이드 준수

---

## 3. Detailed Feature Specification

### 👤 User & Customization
* **Profile Data:** 국적(국기 표시), 전공, 닉네임, 성별(선택).
* **Character System (Layered):** * 픽셀 아트 기반의 레이어 시스템 구조.
    * **Layer Order:** Base -> Bottom -> Top -> Shoes -> Hair -> Accessories.
* **Character Item Management (Admin):** 
    * 각 아이템은 고유 ID, 종류(카테고리), 이름, 가격, PNG 파일 경로 등의 메타데이터를 가짐.
    * 서버측 관리자(Admin)가 새로운 캐릭터 아이템을 등록(POST)하고 관리할 수 있는 시스템.
* **Accessories:** 노트북, 커피, 태블릿, 연필 등 전공 특화 아이템.
* **Networking:** * 개인 코드(Friend Code) 기반 친구 추가 시스템.
    * 친구 그룹 기능을 통해 타 전공 친구의 상태도 실시간 확인 가능.

### ⏱️ Real-time Stopwatch (Core)
* **Room System:** * **전공방:** 동일 전공 유저들이 모이는 실시간 채널.
    * **커스텀 방:** 친구 추가된 지인들끼리 모이는 프라이빗 공간.
* **Interactive Features:** * 스톱워치 시작 시 '공부 키워드' 설정 및 '질문 받기 허용' 체크박스 제공.
    * **질문 받기 UI:** 인스타 라이브 댓글 형식의 실시간 오버레이 또는 익명 쪽지를 통한 개별 채팅 전환.
* **Gamification:** 공부 시작 시 내 캐릭터가 선택한 아이템(노트북 등)을 들고 공부하는 모션 동기화.

### 📊 Statistics & Dashboard
* **Visualization:** 주별/월별 누적 공부 시간 통계 그래프.
* **Insights:** 자주 학습한 키워드 분석을 통한 개인 맞춤형 대시보드 생성.

---

## 4. Monetization (Income Model)
* **In-app Purchase:** 기본 에셋 외 특수 코스튬 및 한정판 아이템 (소액 결제).
* **Subscription (MajorMate+):** * 익명 쪽지 발송권 무제한 (기본 유저는 주 N회 제한).
    * 광고 제거 (Ad-Free).
    * 전용 캐릭터 에셋 및 특별 프로필 테마 제공.

---

## 5. Development Strategy (For AI Agents)
1.  **Contract-First:** * 백엔드 엔티티 및 API 명세(Swagger)를 최우선으로 확정한다.
    * `openapi.json` 추출 후 프론트엔드 API 클라이언트 및 통신 인터페이스를 자동 생성한다.
2.  **Layered Rendering:** * 캐릭터 에셋은 카테고리별
