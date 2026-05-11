이 프로젝트의 변경 사항을 리뷰하라.

먼저 다음 문서들을 읽어라:
- `CLAUDE.md`
- `majormate-server/CLAUDE.md`
- `majormate-app/CLAUDE.md`
- `docs/PRD.md`

그런 다음 변경된 파일들을 확인하고, 아래 체크리스트로 검증하라:

## 체크리스트

1. **아키텍처 준수**: `majormate-server/CLAUDE.md`에 정의된 패키지 구조(controller/service/repository/domain/dto)를 따르는가?
2. **기술 스택 준수**: 서버는 Spring Boot 3.3.4 + Java 21, 앱은 React Native (Expo) 범위를 벗어나지 않았는가?
3. **테스트 존재**: 서버 Service 레이어 변경에 대한 JUnit5 테스트가 작성되어 있는가?
4. **CRITICAL 규칙**: CLAUDE.md의 시크릿 커밋 금지, TDD 순서 등 CRITICAL 규칙을 위반하지 않았는가?
5. **빌드 가능**: `cd majormate-server && ./gradlew build` 에러 없이 통과하는가?
6. **OpenAPI 동기화**: 컨트롤러 변경 시 `docs/api/openapi.json`이 업데이트되었는가?

## 출력 형식

| 항목 | 결과 | 비고 |
|------|------|------|
| 아키텍처 준수 | ✅/❌ | {상세} |
| 기술 스택 준수 | ✅/❌ | {상세} |
| 테스트 존재 | ✅/❌ | {상세} |
| CRITICAL 규칙 | ✅/❌ | {상세} |
| 빌드 가능 | ✅/❌ | {상세} |
| OpenAPI 동기화 | ✅/❌/해당없음 | {상세} |

위반 사항이 있으면 수정 방안을 구체적으로 제시하라.
