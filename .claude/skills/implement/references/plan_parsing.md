# Plan File Parsing Guide

## Supported Checkbox Formats

| Format | Meaning |
|---|---|
| `- [ ] task` | Pending |
| `- [x] task` | Complete |
| `- [X] task` | Complete (uppercase variant) |
| `- [~] task` | In-progress (treat as pending) |

## Phase Detection Patterns

Phases are identified by headings that match patterns like:

- `### Phase 1: ...`
- `## Phase 1 — ...`
- `### 1단계: ...`
- `## Step 1: ...`

Group all tasks (and nested tasks) under the nearest preceding phase heading.

## Nested Tasks

Tasks may have sub-bullets:

```markdown
- [ ] **백엔드 작업**
  - API endpoint 구현
  - DTO 설계
```

Treat each sub-bullet as an implicit sub-task. Mark the parent `[x]` only when all sub-bullets are covered. If sub-bullets have no own checkboxes, add them when starting work so progress can be tracked.

## Warning Blocks

Blocks like `> [!IMPORTANT]` or `> [!WARNING]` are notes for the human, not tasks. Do not mark them as complete; surface their content to the user when relevant.

## Verification Plan Section

A section titled `## Verification Plan`, `## Test & QA`, or similar contains post-phase checks. After finishing all tasks in a phase, execute the checks described there before marking the phase done.

## Contract-First Detection

If a task description contains keywords like "API", "endpoint", "swagger", "openapi", "명세", "스펙", treat it as a contract-first task:

1. Produce or update the OpenAPI spec file first
2. Get implicit or explicit confirmation the contract looks right
3. Then implement the actual code

## Updating Checkboxes In-Place

When marking a task complete, use a targeted edit that changes only `[ ]` → `[x]` on the exact line. Do not reformat, reorder, or re-indent surrounding text.
