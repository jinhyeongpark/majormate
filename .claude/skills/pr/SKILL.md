---
name: pr
description: This skill should be used whenever the user asks to "PR 올려줘", "PR 만들어줘", "push하고 PR", or any request to publish current changes as a pull request. It performs the full workflow: git add → git commit (logically split) → git push → gh pr create, following the project's branch policy (dev → main).
---

# PR Skill

Perform the complete publish workflow — staged commit(s), push, and pull request creation — in one flow.

## Branch Policy

- All work branches off and pushes to `dev`.
- PRs target `main` from `dev`.
- Never push directly to `main`.

## Step 1 — Understand the Current State

Run these in parallel:

```bash
git status          # untracked / modified files
git diff            # full diff of unstaged changes
git diff --cached   # already-staged changes
git log --oneline -5  # recent commit style reference
```

## Step 2 — Split Commits Logically

Group changed files by concern. Each commit should answer "what changed and why" without mixing unrelated concerns. Common split patterns:

| Commit | Files |
|---|---|
| `feat:` / `fix:` — core code change | `src/**`, migration SQL, config that enables the feature |
| `docs:` — documentation only | `CLAUDE.md`, `README.md`, `*.md` plan files |
| `chore:` — tooling / dependencies | `build.gradle`, `settings.gradle`, `docker-compose.yml` |
| `test:` — tests only | `src/test/**` |

Rules:
- If a file is a secret or in `.gitignore`, skip it entirely — never stage it.
- Prefer specific `git add <file>` over `git add -A` or `git add .`.
- One logical change = one commit. Three files that all belong to the same feature = one commit.
- Mark each commit `[x]` in `implementation_plan.md` only when the work is verified.

## Step 3 — Commit Message Format

Follow the existing repo style from `git log`. Default format:

```
<type>(<scope>): <short imperative summary>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

End every commit message with:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Pass the message via heredoc to preserve formatting:
```bash
git commit -m "$(cat <<'EOF'
chore: downgrade Spring Boot to 3.3.4 and fix Flyway config

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## Step 4 — Push

```bash
git push -u origin dev   # first push on branch
git push                  # subsequent pushes
```

Never force-push without explicit user instruction.

## Step 5 — Create Pull Request

Use `gh pr create` targeting `main` from `dev`:

```bash
gh pr create --base main --head dev --title "<title>" --body "$(cat <<'EOF'
## Summary
- <bullet>

## Test plan
- [ ] <check>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- Keep the title under 70 characters.
- Summary: 2–4 bullets covering what changed and why.
- Test plan: concrete checkboxes the reviewer can verify.
- Return the PR URL to the user when done.
