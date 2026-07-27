# Bangkok Bank Candidate Test — Bookmark Manager

## 1. Overview

A personal bookmark manager: users log in, organize bookmarks into
collections, and can generate a read-only public link to share a
collection.

**Tech stack:**
- **Backend:** NestJS + Prisma 7 + PostgreSQL
- **Frontend:** React + Vite + MUI
- **Auth:** Auth0, Authorization Code + PKCE (access token as Bearer
  credential — see [DECISIONS.md](DECISIONS.md))

## 2. Prerequisites

- **Node.js** 22+ (developed and tested against v24.18.0)
- **npm** (ships with Node)
- **Docker** with Compose v2 (Docker Desktop on Windows/Mac, or Docker
  Engine + the `docker-compose-plugin` on Linux) — for the local Postgres
  container. No other local Postgres install needed.

## 3. Setup

Every command below was run end-to-end against a fresh container +
freshly reinstalled dependencies to confirm this sequence actually works,
not written from memory.

### 3.1 Clone and install dependencies

```bash
git clone https://github.com/noxnacx/BangkokBank-TestFullStackDeveloper.git
cd BangkokBank-TestFullStackDeveloper

cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3.2 Configure environment variables

**Backend** (`backend/.env` is gitignored — it's not in the repo, copy it
from the example):

```bash
cd backend
cp .env.example .env
```

Nothing in `backend/.env.example` needs editing — every value is either a
local dev Postgres credential invented for this project, or the public
Auth0 tenant identifiers already verified in [DECISIONS.md](DECISIONS.md)
(`AUTH0_ISSUER`, `AUTH0_AUDIENCE`).

**Frontend** (`frontend/.env` **is** committed to the repo, since none of
its values are secret either — a SPA's `client_id` is public by design
under PKCE). No action needed here, but for reference it contains:

```
VITE_AUTH0_DOMAIN=dev-yg.us.auth0.com
VITE_AUTH0_CLIENT_ID=H9F6QG5SzTKMv0tbmgxLj9LjG1EKVllA
VITE_AUTH0_AUDIENCE=https://bbl-candidate-test-api
VITE_API_BASE_URL=http://localhost:3001
```

`VITE_AUTH0_CLIENT_ID` above is the real client_id from the original
spec (its Auth0 Application has `http://localhost:3000/callback`
registered as an allowed callback URL — that's *why* the frontend has to
run on port 3000, see below).

### 3.3 Start Postgres

```bash
cd backend
docker compose up -d
```

This starts a single `postgres:17-alpine` container on **port 5433** (not
the default 5432, so it won't collide with a Postgres you might already
have running locally), with data persisted in a named volume across
restarts.

> **Troubleshooting:** `docker compose up -d` returns as soon as the
> container starts, not once Postgres inside it is ready to accept
> connections — if the very next command (migrate) fails with a
> connection error, wait a few seconds and retry.

### 3.4 Run migrations and seed data

```bash
# still in backend/
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
```

`prisma:seed` creates two test users' worth of data:
- **User A** (`candidate@test.com`'s real Auth0 `sub`): 2 collections, 5
  bookmarks
- **User B**: a placeholder identity used only to prove ownership
  isolation between two different users in tests — it doesn't correspond
  to a real Auth0 account and can't actually log in

Re-running `prisma:seed` is safe — it clears and recreates just these two
users' data, nothing else.

### 3.5 Start the backend

```bash
# still in backend/
npm run start:dev
```

Runs on **http://localhost:3001** (not 3000 — see 3.6). Confirm it's up:

```bash
curl -i http://localhost:3001/me
# expect: 401 Unauthorized (every route requires a Bearer token except /shared/:token)
```

### 3.6 Start the frontend

```bash
cd frontend
npm run dev
```

Runs on **http://localhost:3000**. This port is not arbitrary — the
Auth0 Application's registered callback URL is fixed at
`http://localhost:3000/callback`, so the frontend needs to own port 3000
specifically (the backend moved to 3001 to make room; see
`frontend/vite.config.ts`, which sets `strictPort: true` so a port clash
fails loudly instead of silently running on the wrong port).

Open **http://localhost:3000** in a browser.

### 3.7 Log in

Click **Log in**, then use:

```
Email:    candidate@test.com
Password: @password1234
```

This redirects through Auth0's Universal Login and back to
`/callback`, which exchanges the code for an access token via PKCE. You
should land back on the Home page showing "Logged in as Candy".

## 4. Running Tests

| Command | Where | Needs DB running? |
|---|---|---|
| `npm test` | `backend/` | No — unit tests mock `PrismaService` entirely |
| `npm run test:e2e` | `backend/` | **Yes** — boots the real `AppModule` (incl. `PrismaModule`) against the `test` schema in the same Postgres container |

```bash
cd backend
npm test        # 58 unit tests
npm run test:e2e  # 6 e2e tests — requires docker compose up -d from step 3.3
```

The frontend has **no automated test suite** (no test runner is wired up
in `frontend/package.json`) — every frontend feature was instead verified
with live Playwright scripts driven against the real running app (real
JWTs, real backend, real DB) during development. Those scripts were
throwaway verification tools, not committed as a repeatable suite; the
narrative of what was checked and what it found is in
[transcripts/](transcripts/) (10 through 16).

## 5. What's Done vs Skipped

**Backend — done:**
- Auth guard verifying Auth0 access tokens (RS256, JWKS, aud/iss/exp, algorithm-confusion-safe)
- `/collections` full CRUD + `/collections/:id/bookmarks`
- `/bookmarks` full CRUD with `?collectionId=` filter
- Ownership isolation enforced at the query level for every endpoint (see [Security Notes](#10-security-notes))
- Read-only collection sharing via token (`/collections/:id/share`, `/shared/:token`)
- 58 backend unit tests + 6 e2e tests, all passing

**Frontend — done:**
- Auth0 PKCE login/logout, in-memory token (no localStorage)
- `/collections` page: list, create, view detail, edit, delete
- `/bookmarks` page: list, create, view detail, edit, delete, filter by collection
- Share UI (generate/copy/revoke link) + public `/shared/:token` read-only page

**Explicitly not done (with reasons):**
- **Full multi-owner collection sharing** (a collection with several real
  co-owners, each with their own permissions) — read-only token links
  were implemented instead; see the "Share collection" entry in
  [DECISIONS.md](DECISIONS.md) for the trade-off
- **Docker for the backend/frontend apps themselves** — only Postgres is
  containerized; the apps run directly via `npm run start:dev` / `npm run dev`
- **CI/CD pipeline** — tests are run locally/manually, no GitHub Actions
  (or similar) workflow was set up
- **An "all bookmarks across everything" combined view** beyond what
  `/bookmarks` (with its collection filter) already provides
- **Full-text search** over bookmarks/collections

## 6. Architecture Decisions

Full write-ups with context and trade-offs in [DECISIONS.md](DECISIONS.md):

- **Access token (not ID token) as the Bearer credential** — verified via
  the tenant's real discovery document + JWKS before deciding, not assumed
- **No `User` model** — `ownerId` is the Auth0 `sub` claim used directly;
  Auth0 is the identity source of truth, no local profile data exists yet
  to justify a sync table
- **`onDelete: SetNull` for `Bookmark.collectionId`** — deleting a
  collection un-categorizes its bookmarks rather than deleting them
- **Read-only share link instead of full multi-owner sharing** — smallest
  change that doesn't touch the existing single-owner ownership pattern
  at all

## 7. API Documentation

Full endpoint list, request/response shapes, and the reasoning behind
every ownership/error-handling decision: [API_DESIGN.md](API_DESIGN.md).

## 8. AI Workflow & Process

How this project was built with Claude Code — tools used, task
decomposition, what worked and what didn't on the first try:
[AI_WORKFLOW.md](AI_WORKFLOW.md).

Full prompt-by-prompt transcripts: [transcripts/](transcripts/).

## 9. Project Structure

```
.
├── backend/                 NestJS API
│   ├── prisma/               schema, migrations, seed script
│   ├── src/
│   │   ├── auth/              AuthGuard (JWT verification), @Public() decorator
│   │   ├── collections/       CollectionsModule: CRUD + sharing
│   │   ├── bookmarks/         BookmarksModule: CRUD
│   │   └── prisma/            PrismaService (Prisma Client wrapper)
│   ├── test/                  e2e tests (real AppModule + DB)
│   └── docker-compose.yml     local Postgres container
├── frontend/                 React SPA
│   └── src/
│       ├── auth/               Auth0Provider, RequireAuth guard
│       ├── api/                typed fetch wrappers per resource
│       └── pages/              Home, Collections, Bookmarks, Shared, Callback
├── transcripts/             prompt-by-prompt session logs
├── DECISIONS.md             architecture decisions with reasoning
├── API_DESIGN.md            full API reference
└── AI_WORKFLOW.md           how this was built with Claude Code
```

## 10. Security Notes

- **Ownership enforced at the query level, not after fetching** — every
  read/update/delete query filters by `{ id, ownerId }` (or is scoped
  through a collection that's itself ownership-checked) simultaneously,
  so "belongs to someone else" and "doesn't exist" are indistinguishable
  by construction, not by convention.
- **404, never 403, for another user's resource** — a 403 would confirm
  the resource exists; returning 404 either way leaks nothing about
  whether it exists at all.
- **Access tokens verified with RS256 pinned explicitly** (not trusted
  from the token's own `alg` header), against the tenant's real JWKS,
  checking signature + `aud` + `iss` + `exp` — this is what stops an
  algorithm-confusion attack, given the tenant has `HS256` enabled
  tenant-wide for other purposes.
- **Public share links are read-only by construction** — the controller
  serving `/shared/:token` has no update/delete method declared at all,
  not just unimplemented business logic, and is scoped to exactly the one
  collection the token points to (looked up by token, never by owner).

Full detail and the live-HTTP tests that verify each of these:
[API_DESIGN.md](API_DESIGN.md).
