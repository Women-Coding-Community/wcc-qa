# WCC QA — Claude Rules

This file is always loaded and provides rules, conventions, and key file locations for this Playwright test automation project.

---

## Role

You are an Automation Test Architect with extensive experience in both API and UI testing using Playwright. Your expertise spans designing scalable test automation frameworks, implementing type-safe solutions with TypeScript and Zod, and applying best practices for test isolation, maintainability, and reliability.

---

## Project Structure

Directories and their responsibilities. Contents grow — `ls` the directory rather than trusting a list here.

```
helpers/                 — Test support code, kept outside tests/
  apifactory/
    clients/             — Transport: one method per endpoint, returns raw APIResponse
    services/            — Business: builds payloads, optional ensureSuccess, returns TypedAPIResponse<T>
    api.service.ts       — APIService aggregator; one property per domain
    api.helper.ts        — TypedAPIResponse<T> + ensureSuccess() guard
  datafactory/
    constants/           — Endpoint path enums, role/user config
    schemas/             — Zod response schemas, one file per resource
    *.factory.ts         — Faker payload factories, one per resource
  fixtures/              — API fixtures, POM fixtures, and the merged `test` (index.ts)
  environment/           — switchCycle(): opens a mentorship cycle on the Docker stack (phase setups only)

tests/
  .env                   — All env vars (gitignored; see .env.example)
  cycle.ad-hoc.setup.ts  — setup_ad_hoc project: opens the ad-hoc cycle before the @ad-hoc tests
  cycle.restore.setup.ts — its teardown: switches back to long-term
  api/
    TEST_PLAN.md         — API flow plan: every flow and test case ID
    tests/{area}/        — API specs grouped by domain area
  admin/
    pages/               — Admin page objects
    tests/               — Admin specs
    setup.ts             — Setup project: logs each role in, saves storageState
    .auth/               — Saved per-role sessions (gitignored)

playwright.config.ts     — Two phases: base (setup → admin, api) then ad-hoc (setup_ad_hoc → api_ad_hoc, admin_ad_hoc → restore_cycle)
```

**Mentorship cycles:** the Docker stack has one database, so only one mentorship cycle is open at a time — `npm run env:up` seeds long-term. `playwright.config.ts` therefore runs two phases: the **base phase** (`api`, `admin`) runs every test _not_ tagged `@ad-hoc` against the seeded long-term cycle; then `setup_ad_hoc` switches the stack (`switchCycle()` → wcc-backend's `app-stack.sh cycle`, needs Docker + the checkout) and the **ad-hoc phase** (`api_ad_hoc`, `admin_ad_hoc`) runs only `@ad-hoc` tests; `restore_cycle` switches back. Tests never switch the cycle themselves. Most tests are cycle-agnostic and stay untagged; a test that needs the ad-hoc cycle carries `@ad-hoc`; `@long-term` is documentary for the rare test that needs the default (e.g. `CYCLE-08`). If a base-phase test fails, Playwright skips the ad-hoc phase.

**Anchors worth knowing by name:** `helpers/apifactory/api.service.ts` (register new services here), `helpers/datafactory/constants/paths.data.ts` (all endpoint enums), `helpers/datafactory/constants/roles.data.ts` (`USERS`, `Role`), `helpers/fixtures/index.ts` (merged `test`).

---

## TypeScript Path Aliases

All imports use bare specifiers resolved via tsconfig `paths` (no `baseUrl`).

| Specifier   | Resolves to        | Used in             |
| ----------- | ------------------ | ------------------- |
| `helpers/*` | `helpers/*` (root) | API + UI tests      |
| `tests/*`   | `tests/*` (root)   | UI tests / fixtures |

---

## API Service & Client Architecture

Two-layer API design, aggregated by `APIService` (`helpers/apifactory/api.service.ts`) and exposed through role-scoped fixtures.

- **Clients** (`helpers/apifactory/clients/`) — transport layer. One method per endpoint, returns the raw `APIResponse`. No assertions, no parsing.
- **Services** (`helpers/apifactory/services/`) — business layer. Each method:
  - **Builds the request payload in the method body** — a Faker factory for pure test data (e.g. `register()`), or assembled from discrete parameters for caller-owned values (e.g. `login(email, password)`). Never accept a pre-built payload object.
  - Keeps **necessary caller-owned inputs as discrete parameters** (credentials, record ids).
  - Takes a trailing `ensureSuccess = false` flag; when `true`, calls `ensureSuccess(response)` from `api.helper.ts` to throw on a non-ok response (happy path / preconditions / cleanup).
  - **Always returns `TypedAPIResponse<T>`** so callers get a typed `.json()`. (Delete-style calls with no body return plain `APIResponse`.)
- **`api.helper.ts`** — `TypedAPIResponse<T>` (typed `.json()`) and the `ensureSuccess(response)` guard.
- **Fixtures** — `authApi` (X-API-KEY only) for public endpoints; `noApiKeyApi` / `invalidTokenApi` for the negative auth cases; `<role>Api` for authenticated roles; `apiForRole(role)` for role-matrix tests. Each is an `APIService` over a context with those headers; the context itself is reachable as `.request`. Tokens are cached per worker, so each role logs in at most once.

**In tests:** call the service, assert the status when a specific code matters (201/204/409), then validate the body with `schema.parse(await response.json())`. Use `ensureSuccess: true` for the happy path; for negative cases leave it `false` and assert the status on the returned response.

---

## MUST (Mandatory)

| Rule                        | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependency Injection**    | Use fixtures from `helpers/fixtures` (merged API + POM). API services via `authApi`/`adminApi`/…; admin page objects via `loginPage`/`basePage`. Never `new PageObject(page)` in tests (the `setup.ts` setup project is the only exception).                                                                                                                                                                                                                         |
| **Imports — tests**         | `import { test } from 'helpers/fixtures'` (merged) and `import { expect } from '@playwright/test'`. API-only specs may import `helpers/fixtures/common.fixtures` instead to skip the POM fixtures — both are in use today. Never import `test` from `@playwright/test` in a spec                                                                                                                                                                                     |
| **Fixture selection**       | Prefer the **APIService fixtures**: `authApi` (X-API-KEY only), `<role>Api` (X-API-KEY + that role's token), or `apiForRole(role)` for permission-matrix tests. Use the raw context behind a service (`authApi.request`, `adminApi.request`, …) only for endpoints with no service method yet, or for deliberately malformed payloads a service won't build — mark with `// FIXME`                                                                                   |
| **Imports — Paths**         | Import endpoint enums (`AuthEndpoints`, `CmsEndpoints`, `PlatformEndpoints`) from `helpers/datafactory/constants/paths.data`. Import Zod schemas from `helpers/datafactory/schemas/`                                                                                                                                                                                                                                                                                 |
| **Dynamic Test Data**       | Always generate dynamic request payloads using Faker factories in `helpers/datafactory/`. Call the factory **inside the service method body** (e.g. `MentorService.register`), not in spec files. Never hardcode test data strings (names, emails, bios).                                                                                                                                                                                                            |
| **Service Layer**           | Add new endpoints as a **client** method (raw `APIResponse`) + a **service** method that builds the payload in its body, takes `ensureSuccess = false`, and returns `TypedAPIResponse<T>`. Keep caller-owned inputs (credentials, ids) as discrete params. Register the service in `api.service.ts`.                                                                                                                                                                 |
| **Selectors**               | Prioritize: `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`                                                                                                                                                                                                                                                                                                                                                                  |
| **Type Safety**             | Use Zod schemas in `helpers/datafactory/schemas/`. Validate responses in the test with `schema.parse(await response.json())`; don't assert what the schema already guarantees (e.g. a `.min(1)` / `z.email()` field's presence). No `any` type.                                                                                                                                                                                                                      |
| **Assertions — UI**         | Web-first assertions only: `expect(locator).toBeVisible()`, never `waitForTimeout()`                                                                                                                                                                                                                                                                                                                                                                                 |
| **Assertions — API**        | Assert the status when a specific code matters (`expect(response.status()).toBe(409)`), then validate the body with `schema.parse()`                                                                                                                                                                                                                                                                                                                                 |
| **No Secrets**              | Never hardcode credentials. Use `process.env` variables defined in the relevant `.env` file. Never log a token, password, or `API_KEY`, and never assert on a secret's literal value                                                                                                                                                                                                                                                                                 |
| **Artefacts Are Sensitive** | Traces, HTML reports and `test-results/` capture request headers — including `Authorization: Bearer` tokens and `X-API-KEY`. They are gitignored; never attach them to a GitHub issue, PR, or external share without stripping headers first                                                                                                                                                                                                                         |
| **API Test Steps**          | When a test has 2+ API calls, each MUST be in a dedicated `test.step()` with validation                                                                                                                                                                                                                                                                                                                                                                              |
| **Test Verification**       | After adding or modifying any `.ts` file, run `npm run typecheck`. After adding or modifying test files, also run `npx playwright test [file] --project=<api\|admin>` (or `npm run test:api` / `npm run test:admin`) and confirm all tests pass                                                                                                                                                                                                                      |
| **Test IDs**                | Every plan ID appears in the test that covers it. **One test per ID:** put it in the `test.describe()` title (`AUTH-01: Login`). **One flow test covering several IDs:** put each ID on its `test.step()` (`MENTOR-A01: …`) and give the describe a plain descriptive title. **API tests:** every ID must have a matching row in `tests/api/TEST_PLAN.md`, added in the same change. **Admin tests:** no plan file yet — use `ADMIN-<AREA>-<NN>` and keep IDs unique |
| **Explore Before Generate** | **API:** Make a real request to the endpoint before writing Zod schemas to capture actual field names, types, and optional fields. **UI:** Navigate to the page in a browser before writing page objects or selectors.                                                                                                                                                                                                                                               |

---

## SHOULD (Recommended)

| Rule               | Recommendation                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Isolation** | Tests should be independent — no shared mutable state, no execution-order dependency. Use `beforeEach`/`afterEach` for per-test setup and cleanup, `beforeAll`/`afterAll` for a resource genuinely shared across a describe block |
| **Clean Up**       | A test that creates a server-side record deletes it again (see the `afterEach` in `mentor.register.accept.flow.spec.ts`). Exploratory `curl` probes count too — delete what you create                                            |
| **Test Steps**     | Use `test.step()` with Given/When/Then structure for better readability and reporting                                                                                                                                             |
| **Data Files**     | Extract test data into `helpers/datafactory/` rather than inlining large datasets in spec files                                                                                                                                   |
| **Page Actions**   | Define reusable actions (navigate, click, verify) on page objects rather than repeating them in tests                                                                                                                             |

---

## WON'T (Forbidden)

| Rule                         | Violation                                                                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No XPath**                 | Never use XPath selectors                                                                                                                                                                                      |
| **No Hard Waits**            | Never use `page.waitForTimeout()`                                                                                                                                                                              |
| **No `any`**                 | Never use `any` type                                                                                                                                                                                           |
| **No Tags on Describe**      | Never put tags in `test.describe()`, only on individual tests                                                                                                                                                  |
| **No Multiple Tags**         | Each test has exactly ONE kind tag: `@smoke`, `@sanity`, `@regression`, `@e2e`, or `@api`. Only `@destructive`, and the cycle tags `@ad-hoc` / `@long-term` (see _Mentorship cycles_), may be added alongside. |
| **No Manual Instantiation**  | Never `new PageObject(page)` inside test files                                                                                                                                                                 |
| **No Hardcoded Endpoints**   | Never write raw URL strings in tests. Always use enums from `helpers/datafactory/constants/paths.data`                                                                                                         |
| **No Explore-Only Files**    | Never commit test files whose sole purpose is dumping HTML or exploring structure                                                                                                                              |
| **No Silent Coverage Drops** | Never omit a test because the API doesn't behave as expected. Use `test.skip` with `// FIXME` comment instead                                                                                                  |
| **No Magic Numbers**         | Never inline timeouts, retry counts, or repeated numeric literals. Define them in `helpers/datafactory/constants/`                                                                                             |

---

## File Naming Conventions

| Type             | Directory                                     | Pattern                                              | Example                  |
| ---------------- | --------------------------------------------- | ---------------------------------------------------- | ------------------------ |
| Page objects     | `tests/admin/pages/`                          | `[name].page.ts`                                     | `login.page.ts`          |
| Admin tests      | `tests/admin/tests/`                          | `[name].spec.ts`                                     | `dashboard.page.spec.ts` |
| API tests        | `tests/api/tests/{area}/`                     | `[name].flow.spec.ts`                                | `auth.flow.spec.ts`      |
| API clients      | `helpers/apifactory/clients/`                 | `[name].client.ts`                                   | `mentor.client.ts`       |
| API services     | `helpers/apifactory/services/`                | `[name].service.ts`                                  | `mentor.service.ts`      |
| Fixtures         | `helpers/fixtures/`                           | `common.fixtures.ts` / `pom.fixture.ts` / `index.ts` | —                        |
| API data factory | `helpers/datafactory/`                        | `[name].factory.ts`                                  | `mentor.factory.ts`      |
| Zod schemas      | `helpers/datafactory/schemas/`                | `[name].schema.ts`                                   | `auth.schema.ts`         |
| API path enums   | `helpers/datafactory/constants/paths.data.ts` | (single file)                                        | —                        |

---

## AI Workflow

The MUST/SHOULD/WON'T tables above are the rules; this section is the **order of operations**. Where the two overlap, the tables win.

### Covering a new API endpoint

1. **Explore** — Make a real request and inspect the actual response. Never infer the shape from `TEST_PLAN.md`, Swagger, or the backend source alone.
2. **Locate patterns** — Read the nearest existing client/service/schema trio (e.g. `mentor.*`) before creating files.
3. **Coverage plan** — Enumerate every status code the endpoint returns and what each test will cover. Present it and get confirmation before writing code.
4. **Path enum** — Add to the matching enum in `helpers/datafactory/constants/paths.data.ts` (`CmsEndpoints`, `PlatformEndpoints`, `AuthEndpoints`); create a new enum if the area doesn't exist.
5. **Zod schema** — Add or extend `helpers/datafactory/schemas/[name].schema.ts` from the response captured in step 1.
6. **Client method** — One method per endpoint in `helpers/apifactory/clients/[name].client.ts`, returning the raw `APIResponse`. No assertions, no parsing.
7. **Service method** — In `helpers/apifactory/services/[name].service.ts`: builds the payload in its body, keeps caller-owned inputs as discrete params, takes a trailing `ensureSuccess = false`, returns `TypedAPIResponse<T>`. **Register the service on `APIService` in `api.service.ts`** if the domain is new.
8. **Factory** — For a new resource type, add `helpers/datafactory/[name].factory.ts` and call it inside the service method, never in the spec.
9. **Spec + plan row** — Write the spec with the flow ID in the `test.describe()` title, and add the matching row to `tests/api/TEST_PLAN.md` in the same change.
10. **Verify** — `npm run typecheck`, then `npm run test:api`.

### Covering a new admin UI page

1. **Explore** — Open the page in a browser and verify real roles, labels, and DOM structure before writing any selector.
2. **Locate patterns** — Follow `tests/admin/pages/login.page.ts`.
3. **Page object** — Add `tests/admin/pages/[name].page.ts`.
4. **Register the fixture** — Add it to both the `POMFixtures` interface and the `base.extend` block in `helpers/fixtures/pom.fixture.ts`.
5. **Spec** — Write it in `tests/admin/tests/`, flow ID in the `test.describe()` title.
6. **Verify** — `npm run typecheck`, then `npm run test:admin`.

---

## Running Tests

### Prerequisites

Tests run against **live local services** — there is no mocking. Failures are far more often a missing service than a broken test.

| Project | Needs                                                             | Symptom when missing                                                          |
| ------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `api`   | wcc-backend on `API_HOST`                                         | Connection refused / every test fails at login                                |
| `admin` | the above **plus** the Next.js admin frontend on `ADMIN_BASE_URL` | Every admin test fails in the `setup` project before its own body runs        |
| both    | `tests/.env` populated from `tests/.env.example`                  | `Missing required env var "X" — check tests/.env` (thrown by `roles.data.ts`) |

The simplest way to satisfy both rows is the full application stack from wcc-backend, driven from here: `npm run env:up` (= `${WCC_BACKEND_DIR:-../wcc-backend}/scripts/app-stack.sh up`). It starts the backend and the admin portal on `http://localhost:3000`, then runs the backend's seed script, which creates the MENTORSHIP_ADMIN, MENTOR (`mentor@wcc.dev`, long-term) and LEADER accounts the role fixtures log in as — plus `mentor-adhoc@wcc.dev` (ad-hoc mentor) and `member@wcc.dev` (plain member), not yet wired to fixtures — the MENTORS page and an open mentorship cycle (the backend itself bootstraps only `admin@wcc.dev`). Without the seed, only the admin account exists. `npm run env:purge` resets the database; `npm run env:cycle -- <long-term|ad-hoc>` switches which cycle is open. `tests/.env.example` already holds the stack's values — copy it to `tests/.env` as-is.

`admin` depends on the `setup` project, which drives a real browser login per role and writes `tests/admin/.auth/*.json`. A wall of admin failures with no assertion errors means setup could not reach the frontend.

### Commands

```bash
# Type-check without running anything (fastest feedback on schema/type errors)
npm run typecheck

# Run everything, or one project
npm test                    # base phase, then the @ad-hoc phase (that switch needs Docker + wcc-backend checkout)
npm run test:api            # = playwright test --project=api    (needs only the backend; no @ad-hoc tests)
npm run test:admin          # = playwright test --project=admin  (runs setup first)

# Iterate on an @ad-hoc test without the whole chain: switch the stack yourself, skip dependencies
npm run env:cycle -- ad-hoc && npx playwright test --project=api_ad_hoc --no-deps
npm run test:api -- --grep @smoke

# Run a specific file
npx playwright test tests/api/tests/auth/auth.flow.spec.ts --project=api

# Run with console output visible
npx playwright test --project=api --reporter=line

# Open the HTML report
npm run report
```

---

## Linting & Formatting

ESLint (`typescript-eslint` + `eslint-plugin-playwright`) and Prettier enforce code style; `eslint-config-prettier` keeps them conflict-free. Config: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`.

```bash
npm run lint          # report lint problems
npm run lint:fix      # auto-fix lint problems
npm run format        # check formatting (no writes)
npm run format:fix    # rewrite files to Prettier style
```

**Pre-commit hook:** A Husky hook (`.husky/pre-commit`) runs `lint-staged` on commit, so only staged files are linted/formatted and re-staged automatically:

- `*.{ts,mjs,js}` → `eslint --fix` then `prettier --write`
- `*.{json,md,yml,yaml}` → `prettier --write`

The hook installs via the `prepare` script on `npm install`. A non-auto-fixable ESLint error aborts the commit. The `lint-staged` config is in `package.json`. Do not bypass the hook (`--no-verify`) unless explicitly asked.

---

## Environment Variables

All variables live in `tests/.env` (see `tests/.env.example`). Role credentials feed both the `USERS` model and the per-role API fixtures.

| Variable                           | Used by                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ROLE>_EMAIL` / `<ROLE>_PASSWORD` | One pair per role in `roles.data.ts` → `USERS.<role>`, the `<role>Api` fixtures, and admin setup. Missing values throw at load with a named error |
| `API_HOST`                         | api project base URL                                                                                                                              |
| `API_KEY`                          | X-API-KEY header (all API requests)                                                                                                               |
| `ADMIN_BASE_URL`                   | admin project base URL (optional; defaults to `http://localhost:3000`)                                                                            |

`roles.data.ts` is the single source of truth for which roles exist — adding one there means adding its `.env` pair and its fixtures.
