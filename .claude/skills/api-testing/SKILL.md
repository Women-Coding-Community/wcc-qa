---
name: api-testing
description: Worked examples for WCC QA API tests -- APIService fixture selection, service-layer calls, coverage matrix, and negative/validation test patterns. Use when writing or reviewing tests under tests/api/.
---

# API Testing — Worked Examples

CLAUDE.md holds the rules (MUST/SHOULD/WON'T tables and the architecture description). This skill holds the **worked examples** for applying them. Where the two disagree, CLAUDE.md wins — and the disagreement is a bug worth fixing here.

## Choosing a fixture

All fixtures come from `helpers/fixtures` (merged API + POM). Prefer the **APIService** fixtures — they expose the service layer (`.authentication`, `.cms`, `.mentor`, `.member`).

| Fixture                                                       | When to use                                              | Auth                              |
| ------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------- |
| `authApi`                                                     | Public / registration endpoints (login, `POST /mentors`) | `X-API-KEY` only                  |
| `adminApi` / `leaderApi` / `mentorApi` / `mentorshipAdminApi` | Endpoints needing a Bearer token, as a specific role     | `X-API-KEY` + that role's token   |
| `apiForRole(role)`                                            | Permission-matrix tests looping over roles               | `X-API-KEY` + chosen role's token |

The raw context behind a service (`authApi.request`, `adminApi.request`, …) is an **escape hatch only** — use it when an endpoint has no service method yet, and mark the call with `// FIXME`. The fix is to add the client + service method, not to keep using the context.

Tokens are cached per worker (each role logs in at most once), and contexts are disposed after the test.

## Happy path — service call + schema parse

```typescript
import { expect } from "@playwright/test";
import { test } from "helpers/fixtures";
import { loginResponseSchema } from "helpers/datafactory/schemas/auth.schema";
import { USERS } from "helpers/datafactory/constants/roles.data";

test.describe("AUTH-01: Login", () => {
	// eslint-disable-next-line playwright/expect-expect -- schema.parse() throws on a malformed response, so it is the assertion.
	test("Login with valid credentials returns token", async ({ authApi }) => {
		const response = await authApi.authentication.login(USERS.admin.email, USERS.admin.password, true);

		loginResponseSchema.parse(await response.json());
	});
});
```

Note the trailing `true` — that's `ensureSuccess`, which throws on a non-ok response. Use it for happy paths, preconditions, and cleanup. Read credentials from `USERS` (`helpers/datafactory/constants/roles.data`), never `process.env` directly in a spec.

## Negative path — leave `ensureSuccess` off and assert the status

```typescript
test("Get users as mentor is forbidden", async ({ mentorApi }) => {
	const response = await mentorApi.authentication.getUsers();

	expect(response.status()).toBe(403);
});
```

Don't re-assert what the schema already guarantees. If a field is `z.string().min(1)`, `parse()` passing _is_ the assertion that it's present and non-empty.

## Permission matrix

```typescript
for (const role of ["leader", "mentor"] as const) {
	test(`${role} cannot approve mentors`, async ({ apiForRole }) => {
		const api = await apiForRole(role);

		const response = await api.mentor.accept(mentorId);

		expect(response.status()).toBe(403);
	});
}
```

## Multi-call flows — one `test.step` per call

```typescript
test("Mentor can be registered and approved", async ({ authApi, adminApi }) => {
	let mentorId: number;

	await test.step("Register mentor — 201, status PENDING", async () => {
		const response = await authApi.mentor.register(true);

		const mentor = mentorResponseSchema.parse(await response.json());
		expect(mentor.profileStatus).toBe("PENDING");
		mentorId = mentor.id;
	});

	await test.step("Approve mentor — 200, status ACTIVE", async () => {
		const response = await adminApi.mentor.accept(mentorId, true);

		const mentor = mentorResponseSchema.parse(await response.json());
		expect(mentor.profileStatus).toBe("ACTIVE");
	});
});
```

The Faker payload is built **inside** `mentor.register()`, not in the spec. If you need the generated values, read them off the response.

## Coverage matrix

For every endpoint × method, cover every status code the API can return. Baseline:

| Scenario                                  | Status  | Assert                                     |
| ----------------------------------------- | ------- | ------------------------------------------ |
| Happy path (valid auth + body)            | 200/201 | Schema parses + key fields match sent data |
| Missing Authorization header              | 401     | `status === 401`                           |
| Insufficient permissions (wrong role)     | 403     | `status === 403`                           |
| Empty body (POST/PUT/PATCH)               | 400/422 | Error schema parses                        |
| Each required field omitted individually  | 400/422 | One test per field — see below             |
| Each field with type-inappropriate values | 400/422 | `for...of` loop per field — see below      |
| Non-existent resource ID                  | 404     | `status === 404`                           |
| Unsupported HTTP method                   | 405     | At least one per endpoint                  |

One `test.describe` per method + path. Use `beforeAll`/`afterAll` (not `beforeEach`) for resources shared across tests in a describe block.

## Negative / validation patterns

An empty-body test alone is never sufficient.

### Field omission

```typescript
const requiredFields = ["email", "password"] as const;

for (const field of requiredFields) {
	test(`Login returns 400 when ${field} is missing`, async ({ authApi }) => {
		const { [field]: _omitted, ...payload } = validPayload;

		// FIXME: no service method for malformed-login payloads — using the raw context.
		const response = await authApi.request.post(AuthEndpoints.LOGIN, { data: payload });

		expect(response.status()).toBe(400);
	});
}
```

This is the legitimate escape-hatch case: service methods build well-formed payloads by design, so a deliberately malformed body has to go through the raw context. Mark it.

### Invalid field types

```typescript
const invalidEmails = [123, true, null, "not-an-email"];

for (const invalidValue of invalidEmails) {
	test(`Login returns 400 when email is ${JSON.stringify(invalidValue)}`, async ({ authApi }) => {
		const response = await authApi.request.post(AuthEndpoints.LOGIN, {
			data: { email: invalidValue, password: USERS.admin.password },
		});

		expect(response.status()).toBe(400);
	});
}
```

## When the API misbehaves

Write the test as the spec says it _should_ work, then `test.skip` it with a `// FIXME` naming the actual behaviour. Never bend the expected status to match a bug, and never silently omit the case.

```typescript
// FIXME: API returns 500 instead of 400 for missing password. Backend bug.
test.skip("Login returns 400 when password is missing", async ({ authApi }) => {
	const response = await authApi.request.post(AuthEndpoints.LOGIN, { data: { email: USERS.admin.email } });

	expect(response.status()).toBe(400);
});
```
