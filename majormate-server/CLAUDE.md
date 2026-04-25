# majormate-server — 서버 서브에이전트 컨텍스트

Spring Boot 백엔드 서버. CTO 에이전트가 서버 작업을 위임할 때 이 파일이 컨텍스트로 사용된다.

> **서브에이전트 완료 조건**: 작업 완료 후 반드시 결과를 요약해 CTO에게 반환한다.  
> 반환 내용: 생성·수정된 파일 목록, 새 API 엔드포인트(경로·메서드), DTO 스키마(요청·응답 필드).

## 커맨드

```bash
./gradlew bootRun          # 서버 실행 (포트 8082)
./gradlew build            # 컴파일 및 패키징
./gradlew test             # 전체 테스트 실행
./gradlew clean build      # 클린 빌드
```

단일 테스트 클래스 실행:
```bash
./gradlew test --tests "me.majormate.FullyQualifiedTestClass"
```

## 기술 스택

| 관심사 | 기술 |
|---|---|
| 프레임워크 | Spring Boot 3.3.4, Spring MVC, Java 21 |
| 인증 | Spring Security + OAuth2 (Google) + JWT |
| 영속성 | Spring Data JPA + PostgreSQL |
| 동적 쿼리 | QueryDSL |
| 캐시 / pub-sub | Redis |
| 실시간 | WebSocket + STOMP |
| 코드 생성 | Lombok |

## 패키지 구조

```
me.majormate/
  auth/         # Google OAuth 2.0, JWT, 세션 관리
  user/         # 유저 프로필
  character/    # 6-레이어 픽셀 캐릭터 (Base → Bottom → Top → Shoes → Hair → Accessories)
  friend/       # 친구 코드 기반 네트워킹
  room/         # 전공 기반 공개방 / 커스텀 비공개방
  stopwatch/    # 실시간 학습 타이머 (WebSocket/STOMP)
  stats/        # 주간/월간 학습 통계
  common/       # 공통 유틸, 에러 처리
```

- 엔트리포인트: `src/main/java/me/majormate/MajormateServerApplication.java`
- 애플리케이션 설정: `src/main/resources/application.yaml`

## 개발 컨벤션

- **Contract-first**: 엔드포인트 구현 전에 API 계약을 먼저 확정한다 (`implementation_plan.md` 기준)
- 베이스 패키지: `me.majormate`
- 각 도메인 패키지 내부 구조: `controller/`, `service/`, `repository/`, `domain/`, `dto/`

## OpenAPI 동기화 규칙 (필수)

컨트롤러 코드를 **추가·수정·삭제한 turn과 동일한 turn**에 반드시 `docs/api/openapi.json`을 업데이트한다.

트리거 조건:
- `@RestController` 메서드 추가·수정·삭제
- `@*Mapping` 경로 또는 HTTP 메서드 변경
- Request / Response DTO 필드 변경
- `@PathVariable`, `@RequestParam`, `@RequestBody` 시그니처 변경
- HTTP 상태 코드 변경

업데이트 절차 및 Java → OpenAPI 타입 매핑은 `/sync-openapi` skill을 따른다.

## 참고 문서

- PRD: `../PRD.md` — 전체 기능 명세 및 UX 플로우
- 로드맵: `../implementation_plan.md` — 페이즈별 태스크 목록
- API 명세: `docs/api/openapi.json`
