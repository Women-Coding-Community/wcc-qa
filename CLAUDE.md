# WCC QA — Claude Rules

This file is always loaded and provides rules, conventions, and key file locations for this Playwright test automation project.

---

## Role

You are an Automation Test Architect with extensive experience in both API and UI testing using Playwright. Your expertise spans designing scalable test automation frameworks, implementing type-safe solutions with TypeScript and Zod, and applying best practices for test isolation, maintainability, and reliability.

---

## Project Structure

```
helpers/                           — Test support code (kept outside tests/)
  apifactory/
    api.service.ts                 — APIService aggregator: wires clients+services over one APIRequestContext (.authentication, .mentor, .member)
    api.helper.ts                  — TypedAPIResponse<T> (an APIResponse whose .json() resolves to T) + ensureSuccess(response) guard
    clients/                       — Transport layer: one method per endpoint, returns raw APIResponse (authentication, mentor, member)
    services/                      — Business layer: builds payloads, optional ensureSuccess guard, returns TypedAPIResponse<T> (authentication, mentor, member)
  datafactory/
    constants/
      paths.data.ts                — All API endpoint path enums (CmsEndpoints, AuthEndpoints, PlatformEndpoints)
    schemas/
      auth.schema.ts               — Login/auth Zod schemas
      member.dto.schema.ts         — Member DTO Zod schema
      mentor.schema.ts             — Mentor response Zod schema + profileStatus enum
      user.account.schema.ts       — User account Zod schema
    mentor.factory.ts              — Mentor payload factory using Faker
  fixtures/
    fixtures.ts                    — API fixtures: contexts (authRequest, adminContext/leaderContext/mentorContext/mentorshipAdminContext, contextForRole) + APIService fixtures (authApi, adminApi/leaderApi/mentorApi/mentorshipAdminApi, apiForRole)

tests/
  api/
    .env                           — API env vars: ADMIN_EMAIL, ADMIN_PASSWORD, role creds, API_HOST, API_KEY
    TEST_PLAN.md                   — API flow test plan (all flows and test case IDs)
    tests/
      auth/
        auth.flow.spec.ts          — Auth API tests (Flow 1)
      platform/
        mentor.register.accept.flow.spec.ts — Mentor register & accept flow (Flow 2)
  admin/
    pages/                         — Admin page objects (WIP)
    tests/                         — Admin tests (WIP)

playwright.config.ts               — Two projects: api, admin
tsconfig.json                      — baseUrl: ".", helpers/*, tests/* resolve from root
```

---

## TypeScript Path Aliases

All imports use bare specifiers resolved from the repo root via `baseUrl: "."` (no path aliases).

| Specifier                  | Resolves to                          | Used in    |
| -------------------------- | ------------------------------------ | ---------- |
| `helpers/apifactory/*`     | `helpers/apifactory/*` (root)        | API tests  |
| `helpers/datafactory/*`    | `helpers/datafactory/*` (root) — includes `constants/` & `schemas/` | API tests  |
| `helpers/fixtures/*`       | `helpers/fixtures/*` (root)          | API tests  |

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
- **Fixtures** — `authApi` (X-API-KEY only) for public endpoints; `adminApi` / `leaderApi` / `mentorApi` / `mentorshipAdminApi` for authenticated roles; `apiForRole(role)` for role-matrix tests. Each wraps an `APIService` over the matching context.

**In tests:** call the service, assert the status when a specific code matters (201/204/409), then validate the body with `schema.parse(await response.json())`. Use `ensureSuccess: true` for the happy path; for negative cases leave it `false` and assert the status on the returned response.

---

## MUST (Mandatory)

| Rule                        | Requirement                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependency Injection**    | API tests: use fixtures from `helpers/fixtures/fixtures.ts`. Admin tests: use admin fixtures (WIP). Never `new PageObject(page)` in tests. |
| **Imports — API tests**     | `import { test } from 'helpers/fixtures/fixtures'` and `import { expect } from '@playwright/test'`. For unauthenticated calls only: `import { test as baseTest } from '@playwright/test'` |
| **Fixture selection**       | Prefer the **APIService fixtures** for service-layer calls: `authApi` (X-API-KEY only), `adminApi`/`leaderApi`/`mentorApi`/`mentorshipAdminApi` (X-API-KEY + that role's token), or `apiForRole(role)` for permission-matrix tests. Use the raw **context** fixtures (`authRequest`, `adminContext`, `leaderContext`, `mentorContext`, `mentorshipAdminContext`, `contextForRole(role)`) only for endpoints with no service method yet (mark with `// FIXME`). |
| **Imports — Paths**         | Import endpoint enums (`AuthEndpoints`, `CmsEndpoints`, `PlatformEndpoints`) from `helpers/datafactory/constants/paths.data`. Import Zod schemas from `helpers/datafactory/schemas/`          |
| **Dynamic Test Data**       | Always generate dynamic request payloads using Faker factories in `helpers/datafactory/`. Call the factory **inside the service method body** (e.g. `MentorService.register`), not in spec files. Never hardcode test data strings (names, emails, bios). |
| **Service Layer**           | Add new endpoints as a **client** method (raw `APIResponse`) + a **service** method that builds the payload in its body, takes `ensureSuccess = false`, and returns `TypedAPIResponse<T>`. Keep caller-owned inputs (credentials, ids) as discrete params. Register the service in `api.service.ts`. |
| **Selectors**               | Prioritize: `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`                                       |
| **Type Safety**             | Use Zod schemas in `helpers/datafactory/schemas/`. Validate responses in the test with `schema.parse(await response.json())`; don't assert what the schema already guarantees (e.g. a `.min(1)` / `z.email()` field's presence). No `any` type. |
| **Assertions**              | Web-first assertions only: `expect(locator).toBeVisible()`, never `waitForTimeout()`                                                        |
| **No Secrets**              | Never hardcode credentials. Use `process.env` variables defined in the relevant `.env` file                                                 |
| **API Test Steps**          | When a test has 2+ API calls, each MUST be in a dedicated `test.step()` with validation                                                     |
| **Test Verification**       | After adding or modifying test files, run `npx playwright test [file] --project=[api\|admin]` and confirm all tests pass                    |
| **Explore Before Generate** | **API:** Make a real request to the endpoint before writing Zod schemas to capture actual field names, types, and optional fields. **UI:** Navigate to the page in a browser before writing page objects or selectors. |

---

## SHOULD (Recommended)

| Rule               | Recommendation                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Test Isolation** | Tests should be independent. Use `test.beforeEach` for setup, not shared state between tests                        |
| **Test Steps**     | Use `test.step()` with Given/When/Then structure for better readability and reporting                               |
| **Data Files**     | Extract test data into `helpers/datafactory/` rather than inlining large datasets in spec files                     |
| **Page Actions**   | Define reusable actions (navigate, click, verify) on page objects rather than repeating them in tests               |

---

## WON'T (Forbidden)

| Rule                          | Violation                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **No XPath**                  | Never use XPath selectors                                                                                         |
| **No Hard Waits**             | Never use `page.waitForTimeout()`                                                                                 |
| **No `any`**                  | Never use `any` type                                                                                              |
| **No Tags on Describe**       | Never put tags in `test.describe()`, only on individual tests                                                     |
| **No Multiple Tags**          | Each test has exactly ONE tag: `@smoke`, `@sanity`, `@regression`, `@e2e`, or `@api`. Only `@destructive` may be added alongside. |
| **No Manual Instantiation**   | Never `new PageObject(page)` inside test files                                                                    |
| **No Hardcoded Endpoints**    | Never write raw URL strings in tests. Always use enums from `helpers/datafactory/constants/paths.data`           |
| **No Explore-Only Files**     | Never commit test files whose sole purpose is dumping HTML or exploring structure                                  |
| **No Silent Coverage Drops**  | Never omit a test because the API doesn't behave as expected. Use `test.skip` with `// FIXME` comment instead    |

---

## File Naming Conventions

| Type             | Directory                            | Pattern               | Example                     |
| ---------------- | ------------------------------------ | --------------------- | --------------------------- |
| Page objects     | `tests/admin/pages/`                 | `[name].page.ts`      | `home.page.ts`              |
| API tests        | `tests/api/tests/{area}/`            | `[name].flow.spec.ts` | `auth.flow.spec.ts`         |
| API clients      | `helpers/apifactory/clients/`        | `[name].client.ts`    | `mentor.client.ts`          |
| API services     | `helpers/apifactory/services/`       | `[name].service.ts`   | `mentor.service.ts`         |
| API fixtures     | `helpers/fixtures/fixtures.ts`       | (single file)         | —                           |
| API data factory | `helpers/datafactory/`               | `[name].factory.ts`   | `mentor.factory.ts`         |
| Zod schemas      | `helpers/datafactory/schemas/`       | `[name].schema.ts`    | `auth.schema.ts`            |
| API path enums   | `helpers/datafactory/constants/paths.data.ts` | (single file) | —                       |

---

## AI Workflow

1. **Read This File** — Always loaded. Check it before generating any code.
2. **Explore First**
   - **API:** Before writing a Zod schema, make a real request to the endpoint and inspect the actual response shape. Do not infer schema from documentation alone.
   - **UI:** Before creating or editing page objects, open the page in a browser to verify actual roles, labels, and DOM structure.
3. **Build Coverage Plan (API tests)** — Before writing API test code, enumerate every status code for the target endpoint. For each, state what the test will cover. Present the plan and get confirmation before generating code.
4. **Locate Existing Patterns** — Check `tests/admin/pages/` and `helpers/datafactory/schemas/` for existing patterns to follow before creating new files.
5. **Register New Fixtures** — When adding a new page object, register it in the admin fixtures file.
6. **Add New Paths** — When testing a new endpoint, add the path enum to the appropriate enum in `helpers/datafactory/constants/paths.data.ts`. Create a new enum if the area doesn't exist yet (e.g. `PlatformEndpoints`, `CmsEndpoints`).
7. **Create a Factory** — For any new resource type, create a Faker factory in `helpers/datafactory/[name].factory.ts` and call it inside the service method that builds the request (not in the spec).
8. **Run Tests** — After generating or modifying test files, run the affected tests and confirm they all pass before reporting the task complete.

---

## Running Tests

```bash
# Run all tests for a specific project
npx playwright test --project=api
npx playwright test --project=admin

# Run a specific file
npx playwright test tests/api/tests/auth/auth.flow.spec.ts --project=api

# Run with console output visible
npx playwright test --project=api --reporter=line

# Open HTML report
npx playwright show-report
```

---

## Environment Variables

| Variable         | File                    | Used by         |
| ---------------- | ----------------------- | --------------- |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                       | `tests/api/.env` | api project — `adminContext`            |
| `LEADER_EMAIL` / `LEADER_PASSWORD`                     | `tests/api/.env` | api project — `leaderContext`           |
| `MENTOR_EMAIL` / `MENTOR_PASSWORD`                     | `tests/api/.env` | api project — `mentorContext`           |
| `MENTORSHIP_ADMIN_EMAIL` / `MENTORSHIP_ADMIN_PASSWORD` | `tests/api/.env` | api project — `mentorshipAdminContext`  |
| `API_HOST`       | `tests/api/.env`        | api project     |
| `API_KEY`        | `tests/api/.env`        | api project     |
