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
cp tests/.env.example tests/.env
```

Setup guides for the backend, admin portal and frontend are in [`docs/`](docs/README.md).

### Environment variables

Tests read configuration from **`tests/.env`**. [`tests/.env.example`](tests/.env.example) ships with the local Docker stack's values (`npm run env:up`), so copying it is enough; point the variables elsewhere to target another environment.

| Variable                           | Used by                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `API_HOST`                         | Base URL of the backend (api project and all API fixtures)                            |
| `API_KEY`                          | `X-API-KEY` header sent with every API request                                        |
| `ADMIN_BASE_URL`                   | Base URL of the admin portal (admin project and the login setup)                      |
| `<ROLE>_EMAIL` / `<ROLE>_PASSWORD` | One pair per role in `roles.data.ts`: `ADMIN`, `LEADER`, `MENTOR`, `MENTORSHIP_ADMIN` |

> ⚠️ Never commit real credentials. `.env` is gitignored — all values come from `process.env`.

---

## Running Tests

The suites run against the local Docker stack (see _Local Setup_ in [CONTRIBUTING.md](CONTRIBUTING.md)).

```bash
npm test                  # everything: base phase, then the @ad-hoc phase (Docker + wcc-backend checkout)
npm run test:api          # API tests — needs only the backend
npm run test:admin        # admin UI tests — logs each role in first (setup project)
npm run test:api -- --grep @smoke

npm run typecheck         # type-check without running tests
npm run report            # open the HTML report of the last run
```

For anything finer-grained, call Playwright directly:

```bash
npx playwright test tests/api/tests/auth/auth.flow.spec.ts --project=api
npx playwright test --project=api --reporter=line
npx playwright test --ui
```

Projects in [playwright.config.ts](playwright.config.ts) run in two phases, because the stack has one
mentorship cycle open at a time:

| Phase                       | Project                      | Runs                                                                        | Needs                         |
| --------------------------- | ---------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| base (long-term, as seeded) | `setup`                      | `tests/admin/setup.ts` — logs every role in, saves sessions                 | backend + admin portal        |
|                             | `api`                        | `tests/api/tests/**` not tagged `@ad-hoc`                                   | backend                       |
|                             | `admin`                      | `tests/admin/tests/**` not tagged `@ad-hoc` (Desktop Safari), after `setup` | backend + admin portal        |
| ad-hoc (after base)         | `setup_ad_hoc`               | switches the stack to the ad-hoc cycle                                      | Docker + wcc-backend checkout |
|                             | `api_ad_hoc`, `admin_ad_hoc` | only tests tagged `@ad-hoc`                                                 | as above                      |
|                             | `restore_cycle`              | teardown — switches back to long-term                                       | as above                      |

Admin specs authenticate by loading a role's saved session — e.g. `test.use({ storageState: USERS.mentor.storageState })`.

Most tests don't care which cycle is open and stay untagged. A test that needs the ad-hoc cycle carries `@ad-hoc` and runs in the second phase; `@long-term` is documentary for the rare test that needs the default. To iterate on an `@ad-hoc` test alone: `npm run env:cycle -- ad-hoc && npx playwright test --project=api_ad_hoc --no-deps`.

---

## Nightly run (GitHub Actions)

[.github/workflows/nightly.yml](.github/workflows/nightly.yml) runs the whole suite every night at
02:00 UTC against a fresh stack: it checks out wcc-backend next to this repo, builds and seeds the
QA Docker stack (backend + admin portal; the public website is skipped), and runs `npm test` — the
base phase, then the `@ad-hoc` phase. Failing tests appear as annotations on the run; the HTML
report is attached as an artifact for 7 days.

Run it by hand from **Actions → Nightly → Run workflow** to pick a suite (`all` / `api` / `admin`)
or a wcc-backend branch — handy to check a backend feature branch against the suite before it merges.

---

## Linting & Formatting

Code style is enforced by **ESLint** (with `typescript-eslint` and `eslint-plugin-playwright`) and **Prettier**. The two are kept conflict-free via `eslint-config-prettier`.

```bash
# Lint
npm run lint          # report problems
npm run lint:fix      # auto-fix what ESLint can

# Format
npm run format        # check formatting (no writes)
npm run format:fix    # rewrite files to match Prettier
```

Configuration lives in [eslint.config.mjs](eslint.config.mjs), [.prettierrc.json](.prettierrc.json), and [.prettierignore](.prettierignore).

### Pre-commit hook

A **Husky** pre-commit hook runs **lint-staged** so every commit is automatically linted and formatted — only the files you staged are touched:

- `*.{ts,mjs,js}` → `eslint --fix` then `prettier --write`
- `*.{json,md,yml,yaml}` → `prettier --write`

The fixes are re-staged automatically. If ESLint reports a non-auto-fixable error, the commit is aborted so it can be resolved first.

The hook installs itself on `npm install` via the `prepare` script, so no extra setup is needed after cloning. The hook definition is in [.husky/pre-commit](.husky/pre-commit) and the lint-staged config is the `lint-staged` block in [package.json](package.json).

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
eslint.config.mjs                     ESLint flat config (typescript-eslint + playwright + prettier)
.prettierrc.json / .prettierignore    Prettier formatting rules and ignore list
.husky/pre-commit                     Pre-commit hook — runs lint-staged
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
import { test } from "helpers/fixtures";
import { expect } from "@playwright/test";
import { loginResponseSchema } from "helpers/datafactory/schemas/auth.schema";

test("login returns a valid session", async ({ authApi }) => {
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

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
