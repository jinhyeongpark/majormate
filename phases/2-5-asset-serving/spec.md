# Phase 2.5: 에셋 서빙 — CloudFront URL 통합

## 태스크

- [x] **백엔드 작업 지시**
  - `application.yaml`에 `asset.base-url` 프로퍼티 추가 (`${ASSET_BASE_URL:https://cdn.majormate.com}`).
  - `AssetUrlService` 구현: S3 키 경로(상대 경로)를 CloudFront 전체 URL로 변환.
  - `CharacterService.getCharacter()` 에서 각 레이어 경로(bottom, top, shoes, hair 등)를 CloudFront URL로 변환하여 응답.
  - `CharacterItemService`의 아이템 목록/생성/수정 응답의 `filePath`도 CloudFront URL로 변환하여 반환.
  - **설계 원칙**: DB/관리자 입력은 S3 키 경로(상대 경로)로 저장, 응답 시에만 base-url prefix 적용.
- [x] **프론트엔드 작업 지시**
  - 캐릭터 렌더링 엔진을 로컬 `require('./assets/characters/...')` 방식에서 **서버 API가 반환하는 CloudFront URL 기반 원격 이미지 로딩**으로 교체.
  - `Image source={{ uri: url }}` 방식으로 변경하고, `url`이 `null`인 경우(미장착) 해당 레이어 렌더링을 건너뜀.
  - 원격 이미지 로딩 중 로딩 상태(스켈레톤 또는 fade-in) 처리 추가.
  - 아이템 상점 화면의 아이템 썸네일도 동일하게 CloudFront URL 사용으로 전환.
