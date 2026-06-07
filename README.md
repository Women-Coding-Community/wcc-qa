# WCC QA

Playwright + TypeScript test automation for the WCC platform. The suite is type-safe end to end: requests are built from Faker factories, responses are validated at runtime with Zod, and API calls go through a small client/service layer.

> 🤖 **Contributing with AI tools?** Read [CLAUDE.md](CLAUDE.md) first — it holds the mandatory rules and conventions this project enforces.

---

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Playwright Test](https://playwright.dev) | Test runner + API/browser drivers |
| TypeScript | Type safety (`strict`, no `any`) |
| [Zod](https://zod.dev) | Runtime response-schema validation |
| [Faker](https://fakerjs.dev) | Dynamic test data |
| dotenv | Environment configuration |

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
#    Create tests/api/.env with the variables in the next section
```

### Environment variables

API tests read configuration from **`tests/api/.env`**. Create it with:

```dotenv
# Target API
API_HOST=https://your-api-host
API_KEY=your-x-api-key

# Role credentials (used by the per-role fixtures)
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

There are two Playwright projects defined in [playwright.config.ts](playwright.config.ts): **`api`** (headless API flows) and **`admin`** (Desktop Safari UI — work in progress).

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
    schemas/                          Zod response schemas
    mentor.factory.ts                 Faker payload factories
  fixtures/
    fixtures.ts                       API fixtures (contexts + APIService per role)

tests/
  api/
    .env                              API env vars (not committed)
    TEST_PLAN.md                      Flow + test-case catalogue
    tests/                            API specs ({area}/[name].flow.spec.ts)
  admin/
    pages/                            Admin page objects (WIP)
    tests/                            Admin specs (WIP)

playwright.config.ts                  Projects: api, admin
tsconfig.json                         baseUrl "." → bare imports from repo root
```

All imports use bare specifiers resolved from the repo root (e.g. `helpers/fixtures/fixtures`, `helpers/datafactory/schemas/auth.schema`) — no relative `../../` paths and no path aliases.

---

## API Architecture

A two-layer design, aggregated by `APIService` and exposed through role-scoped fixtures.

- **Clients** ([`helpers/apifactory/clients/`](helpers/apifactory/clients/)) — transport only. One method per endpoint, returns the raw `APIResponse`. No assertions, no parsing.
- **Services** ([`helpers/apifactory/services/`](helpers/apifactory/services/)) — business layer. Each method:
  - **builds its request payload in the body** (a Faker factory for pure test data, or assembled from discrete params like `login(email, password)`);
  - takes a trailing `ensureSuccess = false` flag — when `true` it calls `ensureSuccess(response)` to throw on a non-ok response;
  - **always returns `TypedAPIResponse<T>`**, so callers get a typed `.json()`.
- **Fixtures** ([`helpers/fixtures/fixtures.ts`](helpers/fixtures/fixtures.ts)) — `authApi` (X-API-KEY only) plus `adminApi` / `leaderApi` / `mentorApi` / `mentorshipAdminApi`, and `apiForRole(role)` for permission-matrix tests. Tokens are fetched once per role per worker and cached.

### Example

```ts
import { test } from 'helpers/fixtures/fixtures';
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

---

## Conventions (quick reference)

- **Dependency injection** — get clients/services/pages from fixtures; never `new` them in a test.
- **Dynamic data** — generate payloads with Faker factories inside the service method; never hardcode names/emails/bios.
- **Type safety** — validate responses with `schema.parse(await response.json())`; don't assert what the schema already guarantees. No `any`.
- **Endpoints** — always reference enums from `helpers/datafactory/constants/paths.data`; never inline raw URLs.
- **Steps** — when a test makes 2+ API calls, wrap each in a `test.step()`.
- **Selectors (UI)** — `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`; no XPath, no `waitForTimeout()`.

The full, authoritative rule set lives in **[CLAUDE.md](CLAUDE.md)**. The API flow/test-case catalogue is in **[tests/api/TEST_PLAN.md](tests/api/TEST_PLAN.md)**.
```
