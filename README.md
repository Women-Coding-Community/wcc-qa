# WCC QA

Playwright + TypeScript test automation for the WCC platform. The suite is type-safe end to end: requests are built from Faker factories, responses are validated at runtime with Zod, and API calls go through a small client/service layer.

---

## Prerequisites

- **Node.js** ≥ 18 (developed on v23)
- **npm**

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (needed for the admin/UI project)
npx playwright install

# 3. Configure environment (see below)
#    Copy tests/.env.example to tests/.env and fill in the values
```

### Environment variables

Tests read configuration from **`tests/.env`** (copy [`tests/.env.example`](tests/.env.example)):

```dotenv
# Target API
API_HOST=https://your-api-host
API_KEY=your-x-api-key

# Admin/UI base URL (optional — defaults to http://localhost:3000)
ADMIN_BASE_URL=

# Role credentials (used by the per-role fixtures and the admin setup project)
ADMIN_EMAIL=
ADMIN_PASSWORD=

LEADER_EMAIL=
LEADER_PASSWORD=

MENTOR_EMAIL=
MENTOR_PASSWORD=

MENTORSHIP_ADMIN_EMAIL=
MENTORSHIP_ADMIN_PASSWORD=
```

> ⚠️ Never commit real credentials. `.env` holds secrets only — all values come from `process.env`.

---

## Running Tests

```bash
# All tests (both projects)
npm test

# API tests only
npm run test:api

# Admin (UI) tests only
npm run test:admin

# Type-check without running tests
npm run typecheck

# Open the last HTML report
npm run report
```

For ad-hoc runs (single file, specific reporter), call Playwright directly:

```bash
# A single file
npx playwright test tests/api/tests/auth/auth.flow.spec.ts --project=api

# Live console output
npx playwright test --project=api --reporter=line
```

Three Playwright projects are defined in [playwright.config.ts](playwright.config.ts): **`setup`** (logs each role in and saves its `storageState`), **`api`** (headless API flows), and **`admin`** (Desktop Safari UI; depends on `setup`). Admin tests authenticate by loading a role's saved session — e.g. `test.use({ storageState: USERS.mentor.storageState })`.

---

## Project Structure

```
helpers/                              Test support code (outside tests/)
  apifactory/
    api.service.ts                    APIService aggregator (.authentication, .mentor, .member)
    api.helper.ts                     TypedAPIResponse<T> + ensureSuccess(response)
    clients/                          Transport layer — one method per endpoint, returns raw APIResponse
    services/                         Business layer — builds payloads, optional ensureSuccess, returns TypedAPIResponse<T>
  datafactory/
    constants/paths.data.ts           Endpoint path enums (AuthEndpoints, PlatformEndpoints, CmsEndpoints)
    constants/roles.data.ts           USERS — per-role config (email, password, storageState) + Role type
    schemas/                          Zod response schemas
    mentor.factory.ts                 Faker payload factories
  fixtures/
    common.fixtures.ts                API fixtures (contexts + APIService per role)
    pom.fixture.ts                    UI fixtures (page objects: basePage, loginPage)
    index.ts                          Merged test (API + POM) — import from 'helpers/fixtures'

tests/
  .env                                Env vars: API_HOST, API_KEY, ADMIN_BASE_URL, role creds (not committed)
  api/
    TEST_PLAN.md                      Flow + test-case catalogue
    tests/                            API specs ({area}/[name].flow.spec.ts)
  admin/
    .auth/                            Saved per-role login sessions (not committed)
    setup.ts                          Setup project — logs each role in, saves storageState
    pages/                            Admin page objects
    tests/                            Admin specs

playwright.config.ts                  Projects: setup, api, admin (admin depends on setup)
tsconfig.json                         paths: helpers/* and tests/* → bare imports from repo root
```

All imports use bare specifiers resolved via tsconfig `paths` (e.g. `helpers/fixtures`, `tests/admin/pages/login.page`) — no relative `../../` paths in specs.

---

## API Architecture

A two-layer design, aggregated by `APIService` and exposed through role-scoped fixtures.

- **Clients** ([`helpers/apifactory/clients/`](helpers/apifactory/clients/)) — transport only. One method per endpoint, returns the raw `APIResponse`. No assertions, no parsing.
- **Services** ([`helpers/apifactory/services/`](helpers/apifactory/services/)) — business layer. Each method:
  - **builds its request payload in the body** (a Faker factory for pure test data, or assembled from discrete params like `login(email, password)`);
  - takes a trailing `ensureSuccess = false` flag — when `true` it calls `ensureSuccess(response)` to throw on a non-ok response;
  - **always returns `TypedAPIResponse<T>`**, so callers get a typed `.json()`.
- **Fixtures** ([`helpers/fixtures/common.fixtures.ts`](helpers/fixtures/common.fixtures.ts)) — `authApi` (X-API-KEY only) plus `adminApi` / `leaderApi` / `mentorApi` / `mentorshipAdminApi`, and `apiForRole(role)` for permission-matrix tests. Tokens are fetched once per role per worker and cached. The merged `test` (API + UI page objects) is re-exported from [`helpers/fixtures`](helpers/fixtures/index.ts).

### Example

```ts
import { test } from 'helpers/fixtures';
import { expect } from '@playwright/test';
import { loginResponseSchema } from 'helpers/datafactory/schemas/auth.schema';

test('login returns a valid session', async ({ authApi }) => {
  // ensureSuccess: true → asserts the response is ok before returning
  const response = await authApi.authentication.login(email, password, true);

  // Runtime schema validation; throws (fails the test) on shape drift
  loginResponseSchema.parse(await response.json());
});
```

For negative/permission tests, omit `ensureSuccess` and assert the status on the returned response:

```ts
const response = await adminApi.mentor.accept(mentorId); // no ensureSuccess
expect(response.status()).toBe(409);
```
