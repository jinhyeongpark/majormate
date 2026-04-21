# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
./gradlew bootRun       # Start the application
./gradlew build         # Compile and package
./gradlew test          # Run all tests
./gradlew clean build   # Clean rebuild
```

To run a single test class:
```bash
./gradlew test --tests "me.majormate.FullyQualifiedTestClass"
```

## Architecture

**MajorMate** is a global study platform that connects users by academic major, featuring real-time study tracking and gamification. The server is a Spring Boot 3.3.4 application with Java 21.

### Tech Stack

| Concern | Technology |
|---|---|
| Framework | Spring Boot 3.3.4, Spring MVC |
| Auth | Spring Security + OAuth2 (Google) |
| Persistence | Spring Data JPA + PostgreSQL |
| Dynamic queries | QueryDSL |
| Cache / pub-sub | Redis |
| Real-time | WebSocket + STOMP |
| Code generation | Lombok |

### Key Domain Modules (to be built per `implementation_plan.md`)

1. **Auth** — Google OAuth 2.0 login; issues/manages sessions
2. **Profile & Character** — User metadata and a 6-layer pixel-art character system (Base → Bottom → Top → Shoes → Hair → Accessories)
3. **Friend Networking** — Unique friend codes for peer connections
4. **Study Rooms** — Major-based public rooms and custom private rooms
5. **Stopwatch** — Core real-time study timer synced over WebSocket/STOMP
6. **Statistics** — Weekly/monthly study analytics

### Development Conventions

- **Contract-first**: finalize API contracts before implementing endpoints (per `implementation_plan.md`)
- Base package: `me.majormate`
- Entry point: `src/main/java/me/majormate/MajormateServerApplication.java`
- Application config: `src/main/resources/application.yaml`

### Branch Policy

- **기본 작업 브랜치는 `dev`** — 모든 작업은 `dev`로 push하고 `main`에는 직접 push하지 않는다.
- `main` ← PR (dev) 방식으로만 병합.

### Git & Secrets Policy

- **Never commit secrets.** Before creating any file that contains credentials, API keys, or tokens, check that it is covered by `.gitignore` at the repo root.
- Sensitive file types that must always be ignored: `.env`, `.env.*` (except `.env.example`), `application-local.yaml`, `application-secret.yaml`, `credentials.json`, `service-account*.json`, `*.secret`.
- When adding a new secret-bearing config file, update `.gitignore` first, then create the file.
- If asked to help set up a new integration that requires secrets (OAuth, DB, cloud provider, etc.), always provide an `.env.example` template with placeholder values — never the real values.

### Manual Intervention Policy

When a task requires action that only the user can perform, **stop and present a clear proposal** before proceeding. Do not attempt to work around it or guess at credentials.

Situations that require pausing and asking the user:

- **Secrets / credentials** — Google OAuth Client ID/Secret, API keys, DB passwords, JWT secrets, cloud service account keys. Provide an `.env.example` template and ask the user to fill in the real values.
- **External service setup** — Registering OAuth redirect URIs in Google Cloud Console, enabling APIs, creating cloud resources.
- **Infrastructure that must be manually started** — Docker Desktop not running, VPN required, etc.
- **Schema or data migrations with destructive risk** — Any migration that drops tables or columns, or that is irreversible without a backup.
- **Third-party account actions** — Sending emails, posting to social platforms, publishing to app stores.

**Format for the pause:**
```
⏸ Manual step required: <one-line summary>

What to do:
1. <step>
2. <step>

Once done, reply "계속" (or describe the result) and I will continue.
```

### Key Reference Docs

- `PRD.md` — Full product spec: features, UX flows, monetization model
- `implementation_plan.md` — Phased roadmap with concrete task lists per phase
