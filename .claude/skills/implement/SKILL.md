---
name: implement
description: This skill should be used when the user wants to work through an implementation plan file (e.g. implementation_plan.md). It reads the plan, tracks progress via checkboxes, executes tasks phase by phase, and marks tasks complete as work finishes. Invokable as /implement or /implement [phase number].
---

# Implement Skill

Work through a project's implementation plan file systematically — parsing phases, executing tasks, updating checkboxes, and enforcing dependency order.

## Invocation Forms

- `/implement` — Show overall progress and prompt the user to choose a phase
- `/implement <N>` — Jump directly to Phase N (e.g. `/implement 2`)
- `/implement <N>.<M>` — Jump to a specific task within a phase (e.g. `/implement 2.1`)

## Step 1 — Locate the Plan File

On every invocation, look for the plan file in this priority order:

1. A path passed as an argument (e.g. `/implement my_plan.md`)
2. `implementation_plan.md` in the project root
3. Any `*plan*.md` or `*roadmap*.md` file in the project root

If no plan file is found, ask the user to specify one.

## Step 2 — Parse Progress

Read the plan file and extract:

- All phases (e.g. `### Phase 1: ...`)
- All tasks under each phase (`- [ ] ...` = pending, `- [x] ...` = done)
- Verification/QA steps (usually in a `## Verification Plan` or similar section)

## Step 3 — Show Progress Dashboard (no-arg invocation)

When invoked without a phase number, print a compact summary:

```
Phase 1: 기반 설정 및 API 명세  [2/3 done]  ⬛⬛⬜
Phase 2: 프로필 & 캐릭터        [0/2 done]  ⬜⬜
Phase 3: 친구 시스템            [0/2 done]  ⬜⬜
...
```

Then ask: "어떤 Phase부터 진행할까요? (번호 입력)"

## Step 4 — Dependency Check

Before starting Phase N, verify all previous phases have at least started. If Phase N−1 has unchecked tasks, warn the user:

> ⚠️ Phase N-1 has incomplete tasks. Skipping phases may cause integration issues. Proceed anyway? (y/n)

Proceed only if the user confirms.

## Step 5 — Execute Tasks

For each pending task in the chosen phase:

1. **Announce** the task clearly before starting
2. **Execute** — write code, create files, run tests — following the project's own conventions (check `CLAUDE.md` if present)
3. **Contract-First rule**: if the task involves API endpoints, finalize the OpenAPI/Swagger spec *before* writing controller/service code
4. **Verify** — run any relevant test or build command to confirm the task works
5. **Mark complete** — update the checkbox in the plan file: `- [ ]` → `- [x]`

After all tasks in the phase are done, run any verification steps mentioned in the plan's `Verification Plan` section.

## Step 6 — Post-Phase Summary

After completing a phase, print:

```
✅ Phase N complete — X tasks done.
Next: Phase N+1 (brief title). Start now? (y/n)
```

## Conventions

- Always read `CLAUDE.md` at the start for project-specific build commands, package structure, and coding conventions.
- Never mark a task `[x]` before the work is actually done and verified.
- If a task has sub-bullets, treat each sub-bullet as a checklist item; mark the parent `[x]` only when all sub-items are complete.
- For backend + frontend split tasks, complete the backend task first (API contract → implementation), then the frontend task.
- Preserve the existing file formatting when updating checkboxes — do not reformat surrounding content.

## References

- `references/plan_parsing.md` — Guidelines for interpreting common plan file formats and edge cases
