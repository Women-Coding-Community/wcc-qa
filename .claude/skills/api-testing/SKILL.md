---
name: api-testing
description: API testing patterns -- authRequest + per-role context fixtures, schema validation, and setup/teardown for WCC QA framework
---

# API Testing

## Fixtures

Fixtures for API tests are provided by `helpers/fixtures/fixtures.ts`:

| Fixture                                                                  | When to use                                                        | Auth                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------- |
| `request`                                                                | Unauthenticated calls (login, public endpoints)                   | None — plain Playwright fixture   |
| `authRequest`                                                            | Endpoints needing only `X-API-KEY` (e.g. `POST /mentors`)         | `X-API-KEY` header only           |
| `adminContext` / `leaderContext` / `mentorContext` / `mentorshipAdminContext` | Endpoints needing a `Bearer` token, run as a specific role   | `X-API-KEY` + that role's token   |
| `contextForRole(role)`                                                   | Permission-matrix tests that loop over roles                      | `X-API-KEY` + the chosen role's token |

Each role context logs in with that role's `*_EMAIL` / `*_PASSWORD` env vars and creates an `APIRequestContext` with the correct headers. Tokens are cached per worker (each role logs in at most once per worker), and contexts are disposed after the test. The `Role` type is `'admin' | 'leader' | 'mentor' | 'mentorshipAdmin'`.

### Unauthenticated test (use `baseTest` from `@playwright/test`)

```typescript
import { expect, test as baseTest } from '@playwright/test';
import { AuthEndpoints } from 'helpers/datafactory/constants/paths.data';
import { loginResponseSchema } from 'helpers/datafactory/schemas/auth.schema';

baseTest.describe('AUTH-01: Login', () => {
  baseTest('Login with valid credentials returns token', async ({ request }) => {
    const response = await request.post(AuthEndpoints.LOGIN, {
      data: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(loginResponseSchema.parse(body)).toBeTruthy();
  });
});
```

### Authenticated test (use `test` from fixtures)

Pick the role context the scenario needs. `GET /api/auth/users` requires a Bearer token, so use `adminContext` (not `authRequest`, which only carries `X-API-KEY`).

```typescript
import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures/fixtures';
import { AuthEndpoints } from 'helpers/datafactory/constants/paths.data';
import { usersResponseSchema } from 'helpers/datafactory/schemas/user.account.schema';

test.describe('AUTH-07: Users', () => {
  test('Get users as admin returns user list', async ({ adminContext }) => {
    const response = await adminContext.get(AuthEndpoints.USERS);

    expect(response.status()).toBe(200);

    const body = await response.json();
    const users = usersResponseSchema.parse(body);
    expect(users.length).toBeGreaterThan(0);
  });

  test('Get users as mentor is forbidden', async ({ mentorContext }) => {
    const response = await mentorContext.get(AuthEndpoints.USERS);
    expect(response.status()).toBe(403);
  });
});
```

### Permission-matrix test (loop roles via the factory)

```typescript
for (const role of ['leader', 'mentor'] as const) {
  test(`${role} cannot approve mentors`, async ({ contextForRole }) => {
    const ctx = await contextForRole(role);
    const response = await ctx.patch(`${PlatformEndpoints.MENTORS}/1/accept`);
    expect(response.status()).toBe(403);
  });
}
```

## Imports

```typescript
// Authenticated tests
import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures/fixtures';

// Unauthenticated tests only
import { expect, test as baseTest } from '@playwright/test';

// Endpoint enums
import { AuthEndpoints } from 'helpers/datafactory/constants/paths.data';
import { CmsEndpoints } from 'helpers/datafactory/constants/paths.data';

// Schemas
import { loginResponseSchema } from 'helpers/datafactory/schemas/auth.schema';
import { usersResponseSchema } from 'helpers/datafactory/schemas/user.account.schema';
```

**Never** import `test` from `@playwright/test` in authenticated test files — use the fixture `test` so `authRequest` and the role contexts are available.

## Making Requests

Use Playwright's native `APIRequestContext` methods directly:

```typescript
// GET (Bearer-protected — use a role context)
const response = await adminContext.get(AuthEndpoints.USERS);

// POST with body (public — X-API-KEY only)
const response = await request.post(AuthEndpoints.LOGIN, {
  data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
});

// PUT / PATCH / DELETE (Bearer-protected — use a role context)
const response = await adminContext.put(`${AuthEndpoints.USERS}/${id}`, { data: payload });
const response = await adminContext.delete(`${AuthEndpoints.USERS}/${id}`);
```

Read the response body after the call:

```typescript
const body = await response.json();   // parsed JSON
const status = response.status();     // numeric status code
```

## Response Validation

**Always** validate API responses with Zod schemas:

```typescript
const body = await response.json();

expect(response.status()).toBe(200);
expect(loginResponseSchema.parse(body)).toBeTruthy();  // throws if schema invalid
```

`schema.parse()` provides runtime validation — it throws a `ZodError` with a descriptive message if the response shape doesn't match.

## Test Steps for Multiple API Calls

**MANDATORY:** When a test contains more than one API call, each call **MUST** be wrapped in a dedicated `test.step()` with a descriptive name and validation:

```typescript
test('should register a mentor and find it in the admin list', async ({ authRequest, adminContext }) => {
  let mentorEmail: string;

  await test.step('POST /api/platform/v1/mentors — registers a mentor (X-API-KEY only)', async () => {
    const payload = buildMentorPayload();
    mentorEmail = payload.email;

    const response = await authRequest.post(PlatformEndpoints.MENTORS, { data: payload });

    expect(response.status()).toBe(201);
    expect(mentorResponseSchema.parse(await response.json()).profileStatus).toBe('PENDING');
  });

  await test.step('GET /api/platform/v1/mentors — admin sees the new mentor', async () => {
    const response = await adminContext.get(PlatformEndpoints.MENTORS);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.find((m: { email: string }) => m.email === mentorEmail)).toBeDefined();
  });
});
```

Single API call — `test.step` is optional but recommended for consistency.

## Endpoint Paths

All endpoint paths live in `helpers/datafactory/constants/paths.data.ts` as enums. **Never** write raw URL strings in test files.

```typescript
// CORRECT
import { AuthEndpoints, CmsEndpoints } from 'helpers/datafactory/constants/paths.data';

await request.post(AuthEndpoints.LOGIN, { ... });
await authRequest.get(CmsEndpoints.TEAM);

// FORBIDDEN
await request.post('/api/auth/login', { ... });
```

To add a new endpoint, add it to the appropriate enum in `helpers/datafactory/constants/paths.data.ts`. Create a new enum if the area doesn't exist yet.

## Zod Schemas

Schemas live in `helpers/datafactory/schemas/` and use `z.object()` or `.strict()`.

```typescript
// helpers/datafactory/schemas/auth.schema.ts
import { z } from 'zod';

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().min(1),
  roles: z.array(roleTypeSchema).min(1),
  member: memberDtoSchema.optional().nullable(),
  message: z.string().optional().nullable(),
});
```

Use `.strict()` on schemas where unexpected fields should be rejected:

```typescript
export const userAccountSchema = z.object({
  id: z.number(),
  email: z.string(),
  roles: z.array(roleTypeSchema),
  enabled: z.boolean(),
}).strict();
```

**Before writing a new schema**, make a real request to the endpoint and inspect the actual response — do not guess field names or types from documentation.

### Schema Location

```
helpers/datafactory/schemas/
  auth.schema.ts          — Login response, role enum
  member.dto.schema.ts    — Member DTO
  user.account.schema.ts  — User account, permissions enum
```

Add new schemas here. Name the file `[resource].schema.ts`.

## Comprehensive Testing Coverage

For every endpoint × HTTP method, cover every status code listed in the API spec. Minimum baseline:

| Scenario                                    | Status  | What to assert                                               |
| ------------------------------------------- | ------- | ------------------------------------------------------------ |
| Happy path (valid auth + valid body)        | 200/201 | Schema parse passes + key fields match sent data             |
| Missing Authorization header                | 401     | `status === 401`, validate body with schema or check `null`  |
| Insufficient permissions (wrong role)       | 403     | `status === 403`, validate body with schema or check `null`  |
| Empty body (for POST/PUT/PATCH)             | 400/422 | Error schema parse passes                                    |
| Each required field omitted individually    | 400/422 | One test per field — see Negative Testing below              |
| Each field with type-inappropriate values   | 400/422 | `for...of` loop per field — see Negative Testing below       |
| Non-existent resource ID                   | 404     | `status === 404`                                             |
| Unsupported HTTP method                     | 405     | At least one test per endpoint                               |

**Structure:** One `test.describe` per HTTP method + path. Use `beforeAll`/`afterAll` (not `beforeEach`/`afterEach`) to create/delete shared resources needed by multiple tests in the same describe block.

## Negative / Validation Testing

Testing only with an empty body is never sufficient. For every endpoint that accepts a body:

1. **Empty body** — single test sending `{}`
2. **Each required field omitted** — one test per field, keep all others valid
3. **Each field with type-inappropriate values** — `for...of` loop per field

### Pattern: field omission

```typescript
test.describe('POST /api/auth/login - missing required fields', () => {
  const validPayload = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };

  const requiredFields = ['email', 'password'] as const;
  for (const field of requiredFields) {
    baseTest(`should return 400 when ${field} is missing`, async ({ request }) => {
      const { [field]: _, ...payloadWithoutField } = validPayload;

      const response = await request.post(AuthEndpoints.LOGIN, { data: payloadWithoutField });
      expect(response.status()).toBe(400);
    });
  }
});
```

### Pattern: invalid field types

```typescript
const invalidEmailValues = [123, true, null, undefined, 'not-an-email'];
for (const invalidValue of invalidEmailValues) {
  baseTest(`should return 400 when email is ${JSON.stringify(invalidValue)}`, async ({ request }) => {
    const response = await request.post(AuthEndpoints.LOGIN, {
      data: { email: invalidValue, password: process.env.ADMIN_PASSWORD },
    });
    expect(response.status()).toBe(400);
  });
}
```

## Behavior Mismatch Protocol

When the API's actual behavior differs from the expected status code:

1. **Never silently drop the test** — it must exist in the file.
2. Write the test as the spec says it **should** work.
3. Wrap it with `test.skip` and add a `// FIXME:` comment:

```typescript
// FIXME: API returns 500 instead of 400 for missing password field. Backend bug.
baseTest.skip('should return 400 when password is missing', async ({ request }) => {
  const response = await request.post(AuthEndpoints.LOGIN, {
    data: { email: process.env.ADMIN_EMAIL },
  });
  expect(response.status()).toBe(400);
});
```

Never adjust the expected status code to match buggy behavior.

## Environment Variables

| Variable                                               | File             | Purpose                                  |
| ------------------------------------------------------ | ---------------- | ---------------------------------------- |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                       | `tests/api/.env` | `adminContext` login credentials         |
| `LEADER_EMAIL` / `LEADER_PASSWORD`                     | `tests/api/.env` | `leaderContext` login credentials        |
| `MENTOR_EMAIL` / `MENTOR_PASSWORD`                     | `tests/api/.env` | `mentorContext` login credentials        |
| `MENTORSHIP_ADMIN_EMAIL` / `MENTORSHIP_ADMIN_PASSWORD` | `tests/api/.env` | `mentorshipAdminContext` login credentials |
| `API_HOST`                                             | `tests/api/.env` | `baseURL` for all API requests           |
| `API_KEY`                                              | `tests/api/.env` | `X-API-KEY` header (all contexts)        |

`API_HOST` is set as `baseURL` in `playwright.config.ts` for the `api` project, so relative paths like `/api/auth/login` resolve automatically.

## Fixtures Architecture

```
helpers/fixtures/fixtures.ts   — authRequest, role contexts, contextForRole factory
```

- `authRequest` — `APIRequestContext` with `API_HOST` as `baseURL` and the `X-API-KEY` header only (public/registration endpoints).
- `tokenFor(role)` (worker-scoped) — logs a role in via `POST /api/auth/login` once per worker and caches the token.
- `contextForRole(role)` — builds an `APIRequestContext` with `X-API-KEY` + that role's `Authorization: Bearer <token>`.
- `adminContext` / `leaderContext` / `mentorContext` / `mentorshipAdminContext` — convenience shorthands over `contextForRole`.
