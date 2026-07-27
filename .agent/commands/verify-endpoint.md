---
description: Verify a backend endpoint the way every endpoint in this project has been verified — unit tests + a live HTTP smoke test with real signed JWTs against the real DB, including ownership negative cases.
---

# /verify-endpoint

Use this whenever a new endpoint (or a change to an existing one) needs
verifying before it's considered done. This is not a new process to
figure out — it's the exact pattern every endpoint in this codebase
(`/collections`, `/bookmarks`, `/collections/:id/share`, `/shared/:token`)
was already verified with. Don't re-derive it, don't skip steps because
"the unit tests probably cover it."

## Why both layers, not just one

Unit tests (mocked `PrismaService`) prove the *service logic* is correct
in isolation — they run in milliseconds and are what CI should gate on.
They do **not** prove the route is actually wired up, that
`ValidationPipe` is doing what's assumed, that the JWT verification
really rejects what it should, or that the Prisma query really behaves
the way the mock assumes it does. The live smoke test is what catches
that gap — it's the same category of bug as "builds fine, 500s in prod."
Skipping either layer leaves a real hole; this project has hit real bugs
that only one of the two layers would have caught (see the "why this
matters" note at the bottom).

## Steps

### 1. Unit tests (`*.spec.ts`, mocked `PrismaService`)

For every new service method:
- Happy path: correct `where`/`data` shape passed to the mocked Prisma
  call, correct value returned.
- **Ownership negative case, if the endpoint touches owned data**: mock
  Prisma to return `null` (for reads) or throw the Prisma `P2025`
  "record not found" error (for update/delete) — exactly what a real
  scoped `where: { id, ownerId }` query returns when the row belongs to
  someone else — and assert the service throws `NotFoundException`, not
  something that leaks existence (no `ForbiddenException`, no 403).
- If the endpoint cross-references another owned resource (like
  `Bookmark.collectionId` → `Collection`), same treatment: mock the
  cross-reference lookup as `null` and assert the rejection (`400` in
  this codebase — see `BookmarksService.assertCollectionOwnership`).

Reference: `collections.service.spec.ts`, `bookmarks.service.spec.ts`.

### 2. Live smoke test — real JWT, real DB, real HTTP

Write a throwaway e2e spec (temporary — see cleanup step below) that:

1. Spins up a local JWKS server (`node:http` + a generated RS256
   keypair) and points `AUTH0_ISSUER` at it — the same trick used in
   `test/auth-flow.e2e-spec.ts`. This lets you sign real, valid JWTs for
   any `sub` you want without touching the real Auth0 tenant.
2. Boots the **real** `AppModule` via `Test.createTestingModule({
   imports: [AppModule] }).compile()` — not a controller/service in
   isolation — so the real `ValidationPipe`, real `AuthGuard`, real
   Prisma client, real Postgres are all in the loop.
3. Uses `supertest` to hit the actual route(s) over HTTP with a signed
   `Authorization: Bearer <token>` header, for at least two different
   `sub` values (two "users").
4. Asserts the **cross-owner negative case over real HTTP**: user B
   hitting user A's resource gets `404` (or the endpoint's documented
   equivalent, e.g. `400` for a cross-owner `collectionId` reference) —
   not just that the service function would theoretically do this, but
   that the full stack (routing → guard → pipe → service → Prisma →
   Postgres) actually produces that response.
5. Asserts nothing was actually mutated/leaked by the rejected attempt
   (re-fetch as the real owner and confirm the data is unchanged).
6. Cleans up whatever it created (delete the test rows through the API
   itself, using the owner's token) so repeated runs don't leave orphaned
   data in the dev DB.

Requires Postgres running (`docker compose up -d` in `backend/`).

### 3. Delete the scratch spec file when done

The live smoke test in step 2 is a **verification tool, not a permanent
suite** — name it with a `_scratch-` prefix while working
(`test/_scratch-verify-<thing>.e2e-spec.ts`), run it, confirm it passes,
then delete it. It's already done its job once it's proven the real
stack behaves correctly; leaving it around just adds a slow, redundant
e2e test that duplicates what the fast unit tests already assert for the
happy path.

If the endpoint is important enough to want *permanent* e2e coverage
(auth flow itself is the one exception in this codebase — see
`test/auth-flow.e2e-spec.ts`), say so explicitly; don't default to
keeping every scratch file.

### 4. Re-run full regression before calling it done

```bash
cd backend
npm test         # unit
npm run test:e2e # e2e regression — confirms nothing existing broke
```

## Why this matters (retrospective — not hypothetical)

This exact pattern already caught real bugs in this codebase that unit
tests alone did not, and would not, catch:

- The `ValidationPipe`'s `forbidNonWhitelisted: true` rejecting a spoofed
  `ownerId` field with `400` — assumed it would silently *strip* the
  field instead. Only found this from the live HTTP test; the unit tests
  never exercised the pipe at all.
- A real bug in the frontend's `AuthProvider` where a successful login
  exchange never updated the UI's auth state (state was computed once on
  mount, before the login ever happened) — invisible to any test that
  didn't drive the actual PKCE redirect through a real browser.
- Port/process mixups during manual dev-server verification (Vite
  silently falling back to a port the backend expected to own) — the
  kind of "wiring" bug no unit test touches by definition.

If this command had existed before `/bookmarks` was first implemented,
the cross-owner `collectionId` check would have been live-HTTP-verified
in the same PR as the unit tests, instead of as a separate follow-up
step — same amount of work, just sequenced as one verification pass
instead of two.
