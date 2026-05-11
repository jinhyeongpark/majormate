# Phase 2: 사용자 프로필 & 캐릭터 시스템

## 태스크

- [x] **백엔드 작업 지시**
  - 국적, 전공, 닉네임, 성별 등 기본 사용자 메타 정보 업데이트 API 구현.
  - 캐릭터 레이어를 담당하는 정보(Base > Bottom > Top > Shoes > Hair > Accessories) 6가지 카테고리에 대한 DB Schema 및 DTO 설계 로직 개발.
  - `CharacterItem` 엔티티(아이템 종류, 이름, ID, 가격, 파일 경로 등) 설계 및 관리자(Admin) 전용 아이템 업로드/관리 API(POST/PUT/DELETE) 구현.
- [x] **프론트엔드 작업 지시**
  - 레이어 순서를 엄격히 준수한 렌더링 엔진 작성. ./assets/characters/ 하위 경로를 기준으로 한 이미지 로더 구현.
  - Google Stitch 2.0 기반의 회원 가입 및 캐릭터 설정 화면 구축.
