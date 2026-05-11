# Phase 1: 기반 설정 및 API 명세 최우선 작업 (Contract-First)

## 태스크

- [x] **API 명세 구성 (Swagger/OpenAPI)**
  - Auth, Profile, Room 핵심 도메인에 대한 1차 API 명세 확정 및 /docs/api/ 경로에 openapi.json 파일 생성.
  - 프론트엔드 측 작업 병행을 위한 API 인터페이스 자동 생성 환경 셋업 가이드 구성.
- [x] **백엔드 기반 인프라 셋업**
  - Java 21 + Spring Boot 4.0.5 기반 디렉터리 폴더링 구성. ✅
  - PostgreSQL 및 Redis 로컬 개발 환경 연결 가이드. ✅ (docker-compose.yml 생성)
  - Google OAuth 2.0 Auth 기초 설정 뼈대 작성. ✅
