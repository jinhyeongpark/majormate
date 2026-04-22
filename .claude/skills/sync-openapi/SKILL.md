---
name: sync-openapi
description: majormate-server에서 API 엔드포인트(컨트롤러)를 추가·수정·삭제한 직후 docs/api/openapi.json을 동기화한다. 컨트롤러 코드 변경이 있는 모든 turn에서 자동으로 수행해야 한다.
---

# sync-openapi

API 구현과 OpenAPI 명세를 항상 동기화 상태로 유지하는 워크플로우.

## 트리거 조건

다음 중 하나라도 해당하면 이 워크플로우를 반드시 수행한다:

- `@RestController` / `@Controller` 클래스에 메서드를 추가·수정·삭제
- `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` 경로 또는 HTTP 메서드 변경
- Request / Response DTO 클래스의 필드 추가·수정·삭제
- 컨트롤러 메서드의 `@PathVariable`, `@RequestParam`, `@RequestBody` 시그니처 변경
- HTTP 상태 코드 변경 (예: 200 → 201)

## 워크플로우

### 1단계 — 변경 분석

컨트롤러 코드 수정을 완료한 뒤, 무엇이 바뀌었는지 파악한다:

| 변경 유형 | openapi.json 수정 위치 |
|---|---|
| 새 엔드포인트 추가 | `paths`에 경로 항목 추가 |
| 엔드포인트 삭제 | `paths`에서 해당 operation 제거 |
| 경로·HTTP 메서드 변경 | `paths` 키 수정 |
| 쿼리·경로 파라미터 변경 | 해당 operation의 `parameters` 수정 |
| Request DTO 변경 | `components/schemas`의 해당 Request 스키마 수정 |
| Response DTO 변경 | `components/schemas`의 해당 Response 스키마 수정 |
| 상태 코드 변경 | 해당 operation의 `responses` 키 수정 |
| 새 DTO 추가 | `components/schemas`에 스키마 추가 |
| DTO 삭제 | `components/schemas`에서 스키마 제거 + `$ref` 참조 전수 확인 |

### 2단계 — 현재 명세 읽기

```
파일: majormate-server/docs/api/openapi.json
```

전체 파일을 읽어 현재 상태를 파악한다. 특히 수정 대상 경로와 스키마의 기존 내용을 확인한다.

### 3단계 — 명세 업데이트

다음 규칙에 따라 `openapi.json`을 수정한다:

**경로 네이밍**
- Spring `@RequestMapping("/api/users")` + `@GetMapping("/{id}")` → `"/api/users/{id}"`
- 경로 파라미터는 `{camelCase}` 형식

**operationId**
- `{httpMethod}{ResourceName}` 형식 (예: `getUser`, `createRoom`, `deleteSession`)
- 컨트롤러 메서드명과 일치시키는 것을 권장

**태그**
- 기존 태그 목록(`Auth`, `User`, `Character`, `Friend`, `Room`, `Session`, `Stats`)과 일치시킨다
- 새 도메인이 추가되면 `tags` 최상위 배열에도 항목을 추가한다

**스키마 타입 매핑**
| Java 타입 | OpenAPI 타입 |
|---|---|
| `String` | `"type": "string"` |
| `UUID` | `"type": "string", "format": "uuid"` |
| `LocalDateTime` | `"type": "string", "format": "date-time"` |
| `LocalDate` | `"type": "string", "format": "date"` |
| `Integer` / `int` | `"type": "integer"` |
| `Long` / `long` | `"type": "integer", "format": "int64"` |
| `Boolean` / `boolean` | `"type": "boolean"` |
| `List<T>` | `"type": "array", "items": { "$ref": "#/components/schemas/T" }` |
| `@Nullable` / `Optional` 필드 | `"nullable": true` 추가 |
| `enum` | `"type": "string", "enum": [...]` |

**required 필드**
- `@NotNull`, `@NotBlank` 어노테이션이 붙은 필드는 스키마의 `required` 배열에 포함

**응답 코드**
- `@ResponseStatus(HttpStatus.CREATED)` → `"201"`
- 명시 없는 성공 응답 → `"200"`
- void 반환 + 204 → body 없이 `"204": { "description": "..." }`

### 4단계 — 검증

수정 후 다음 항목을 확인한다:

- [ ] 삭제한 DTO가 다른 스키마에서 `$ref`로 참조되고 있지 않은지
- [ ] 새로 추가한 스키마가 `paths`의 operation에서 올바르게 `$ref` 참조되는지
- [ ] JSON 문법 오류 없음 (괄호 짝, 후행 쉼표 등)
- [ ] `openapi: "3.1.0"` 버전 유지

### 5단계 — 보고

코드 변경 요약 이후에 반드시 아래 형식으로 명세 변경 내용을 함께 보고한다:

```
📄 openapi.json 업데이트
- paths: POST /api/rooms/custom 추가
- schemas: CreateRoomRequest (name: string, required) 추가
```

## 참고

- 현재 명세 파일: `docs/api/openapi.json` (references/openapi-snapshot.md에 구조 요약 있음)
- 도메인 패키지: `src/main/java/me/majormate/{auth,user,character,friend,room,stopwatch,stats}/`
