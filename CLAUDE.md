# CLAUDE.md

Guidance for Claude Code (or any agent) working in this repo.

## What this is

A personal bookmark manager: users log in via Auth0, organize bookmarks
into collections, and can generate a read-only public link to share a
collection. Full details: [README.md](README.md).

## Tech stack & structure

- **Backend** (`backend/`): NestJS + Prisma 7 + PostgreSQL
- **Frontend** (`frontend/`): React + Vite + MUI
- **Auth**: Auth0, Authorization Code + PKCE — access token as Bearer
  credential (not ID token; see [DECISIONS.md](DECISIONS.md) for why)

```
backend/src/
  auth/          AuthGuard (JWT verification), @Public() decorator
  collections/    CollectionsModule: CRUD + sharing
  bookmarks/      BookmarksModule: CRUD
  prisma/         PrismaService (Prisma Client wrapper)
backend/test/     e2e tests (real AppModule + real DB)

frontend/src/
  auth/           Auth0Provider, RequireAuth route guard
  api/            typed fetch wrappers, one file per resource
  pages/          Home, Collections, Bookmarks, Shared, Callback
```

Full tree with descriptions: [README.md § Project Structure](README.md#9-project-structure).

## Patterns to always follow

These aren't stylistic preferences — they're the privacy/security
invariants this codebase is built around. Follow them for any new
endpoint or resource, not just when touching the existing ones.

### 1. Ownership filtering happens *in the query*, never after fetching

```ts
// findOne
this.prisma.collection.findUnique({ where: { id, ownerId } })

// update / delete — atomic, no separate check-then-mutate step
this.prisma.collection.update({ where: { id, ownerId }, data })
this.prisma.collection.delete({ where: { id, ownerId } })
```

Filtering by `{ id, ownerId }` together means "belongs to someone else"
and "doesn't exist" return the identical result (`null`, or Prisma
`P2025` for update/delete) — there's no code path that could leak which
one it was, by construction, not by convention. Never write
`findUnique({ where: { id } })` followed by an `if (row.ownerId !==
ownerId)` check — that's the fetch-then-check anti-pattern this codebase
deliberately avoids.

### 2. 404, never 403, for another user's resource

A 403 confirms the resource exists. Every ownership failure in this app
returns `NotFoundException` (404), converted from Prisma's `null`/`P2025`
via a small `rethrowAsNotFoundIfMissing` helper in each service. See
`CollectionsService`/`BookmarksService` for the exact pattern to copy.

### 3. Standard error shape — don't write a custom exception filter

Every error response is `{ statusCode, message, error }`. This comes
free from NestJS's default exception filter for any `HttpException`
subclass (including what `ValidationPipe` throws) — the only rule to
maintain is that every error path throws through an `HttpException`
subclass, never lets a raw error (e.g. a Prisma error) escape unhandled.

### 4. DTO validation via class-validator + global ValidationPipe

`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform:
true })` is registered once, globally, via `APP_PIPE` in `app.module.ts`.
Consequences to keep in mind when adding a field or endpoint:
- Any field not declared on the DTO class is **rejected with 400**, not
  silently stripped (`forbidNonWhitelisted`) — e.g. a client can't sneak
  an `ownerId` into a POST body.
- `ownerId` always comes from `req.user.ownerId` (the verified JWT `sub`,
  attached by `AuthGuard`), never from the request body.
- PUT = full replace (all fields required, omitted nullable fields get
  cleared to `null`). PATCH = partial update (omitted = untouched,
  explicit `null` = cleared). See `BookmarksService.replace` vs `.update`
  for the concrete difference in how each builds its Prisma `data`.

## Reference docs

- **[DECISIONS.md](DECISIONS.md)** — architecture decisions with full
  reasoning and trade-offs (token choice, no `User` model, `onDelete`
  choice, sharing approach). Check this before revisiting a decision
  that looks arbitrary — it probably isn't.
- **[API_DESIGN.md](API_DESIGN.md)** — full endpoint reference, request/
  response shapes, and the reasoning behind every ownership/error-
  handling decision in detail.

## Dev commands

Full setup from a fresh clone: [README.md § Setup](README.md#3-setup).
Quick reference once already set up:

```bash
# Postgres (backend/)
docker compose up -d

# backend (backend/), runs on :3001
npm run start:dev

# frontend (frontend/), runs on :3000 — port is fixed, matches the
# registered Auth0 callback URL
npm run dev

# tests (backend/)
npm test          # unit tests, no DB needed
npm run test:e2e  # e2e tests, needs docker compose up -d first
```

Frontend has no automated test suite — verify UI changes by actually
running the app and driving it with Playwright (real login, real
backend, real DB), not just a successful `tsc -b`/build.

Login credentials for manual testing: `candidate@test.com` /
`@password1234`.
