# PRD: MajorMate

## 목표
전 세계 같은 전공 학생들을 실시간으로 연결하고, 공부 시간 트래킹과 캐릭터 게이미피케이션으로 학습 동기를 부여하는 글로벌 스터디 플랫폼.

## 사용자
전 세계 대학생 (전공 기반). 혼자 공부하면서 타 전공자들의 공부 현황이 궁금하거나, 외국어로 전공 지식을 교류하고 싶은 사람.

## 핵심 기능

1. **실시간 스톱워치 + 방 시스템**
   - 전공방(동일 전공 유저), 커스텀 방(친구 전용) 두 종류
   - 시작 시 공부 키워드 입력 + 질문받기 허용 토글 설정
   - 방 멤버 목록에 키워드·경과 시간 실시간 표시, 공부 중 키워드 자유 변경
   - 스톱워치 3단계: 시작 → 일시정지(타이머만 멈춤, 세션 유지) → 종료(누적 시간 DB 저장)

2. **캐릭터 커스터마이징**
   - 픽셀아트 레이어 시스템: Base → Bottom → Top → Shoes → Hair → Accessories
   - 512×512 투명 PNG, 레이어별 absoluteFill 렌더링
   - 에셋은 AWS S3 + CloudFront CDN 서빙, DB에는 상대 경로만 저장
   - 공부 시작 시 캐릭터가 선택한 아이템(노트북 등)을 들고 공부하는 모션 동기화

3. **Q&A 연결**
   - 질문받기 허용 상태 유저에게 다른 멤버가 요청 전송
   - 응답자 FCM 수신 → 수락 시 1:1 채팅방 생성, 거절 시 미생성
   - 채팅 내역 DB 저장

4. **친구 시스템**
   - 개인 Friend Code 기반 추가
   - 친구 그룹에서 타 전공 친구의 공부 현황 실시간 확인

5. **FCM 푸시 알림**
   - 친구가 공부 시작 시 알림
   - 질문 요청 수신·수락 시 알림
   - 채팅방 새 메시지 도착 시 알림

6. **통계 대시보드**
   - 주별/월별 누적 공부 시간 그래프
   - 자주 학습한 키워드 분석 기반 개인 맞춤형 인사이트

7. **캐릭터 아이템 관리 (Admin)**
   - 아이템 메타데이터: 고유 ID, 카테고리, 이름, 가격, PNG 경로
   - 관리자 전용 아이템 등록·관리 API

## 수익화
- **인앱 결제**: 기본 에셋 외 특수 코스튬·한정판 아이템 소액 결제, 포인트 시스템
- **MajorMate+ 구독**: 익명 쪽지 무제한(기본은 주 N회 제한), 광고 제거, 전용 캐릭터 에셋·특별 프로필 테마

## MVP 제외 사항
- Apple 소셜 로그인 (초기 Google OAuth만 지원)
- 그룹 채팅 (1:1 Q&A만 지원)
- AI 기반 키워드 추천
- 웹 클라이언트 (모바일 앱만)

## 기술 스택
- **백엔드**: Java 21, Spring Boot 3.3.x, PostgreSQL, Redis, WebSocket+STOMP, FCM, Spring Security + Google OAuth 2.0
- **프론트엔드**: React Native (Expo), Expo Router, React Query, STOMP Client
- **인프라**: AWS S3 + CloudFront (캐릭터 에셋 CDN)

## 디자인
- 픽셀아트 기반 게이미피케이션 UI
- Google Stitch 2.0 디자인 가이드 준수
- 국적 국기 표시, 성별 선택 프로필

## 개발 전략 (AI 에이전트용)
1. **Contract-First**: OpenAPI 명세 선확정 → `openapi.json` 추출 → 프론트엔드 API 클라이언트 자동 생성
2. **Layered Rendering**: 캐릭터 에셋은 카테고리별 레이어로 분리, absoluteFill로 겹쳐 렌더링
3. **TDD**: Service 레이어 구현 시 test agent → RED 확인 → server agent 구현 → GREEN 순서 필수
4. **Harness 자동화**: `implementation_plan.md` → step 파일 설계 → `python3 scripts/execute.py` 실행
