import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { loginResponseSchema, meResponseSchema } from "helpers/datafactory/schemas/auth.schema";
import { usersResponseSchema } from "helpers/datafactory/schemas/user.account.schema";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { WRONG_PASSWORD } from "helpers/datafactory/constants/auth.data";
import { AuthEndpoints } from "helpers/datafactory/constants/paths.data";

test.describe("AUTH-01: Login", () => {
	// eslint-disable-next-line playwright/expect-expect -- schema.parse() throws on a malformed response, so it is the assertion.
	test("Login with valid credentials returns token", { tag: "@smoke" }, async ({ authApi }) => {
		const response = await authApi.authentication.login(USERS[Role.ADMIN].email, USERS[Role.ADMIN].password, true);

		// Schema parse verifies token, expiresAt, and roles are present and well-formed.
		loginResponseSchema.parse(await response.json());
	});
});

test.describe("AUTH-02: Login without credentials", () => {
	test("Login with missing email and password returns 400", { tag: "@regression" }, async ({ authApi }) => {
		// FIXME: raw context — the service always sends both fields; this asserts the @NotNull validation on an empty body.
		const response = await authApi.request.post(AuthEndpoints.LOGIN, { data: {} });

		expect(response.status()).toBe(400);
	});
});

test.describe("AUTH-03: Login with wrong password", () => {
	test("Login with wrong password returns 401", { tag: "@regression" }, async ({ authApi }) => {
		const response = await authApi.authentication.login(USERS[Role.ADMIN].email, WRONG_PASSWORD);

		expect(response.status()).toBe(401);
	});
});

test.describe("AUTH-04: Current user", () => {
	test("Get current user with valid token returns user info", { tag: "@smoke" }, async ({ mentorApi }) => {
		const response = await mentorApi.authentication.me(true);

		const { roles, member } = meResponseSchema.parse(await response.json());
		expect(roles).toContain("MENTOR");
		expect(member.email).toBe(USERS[Role.MENTOR].email);
	});
});

/*
 * Cross-cutting rejections, asserted once here rather than on every endpoint:
 * the API-key filter runs first, and an invalid token is treated as no token.
 */
test.describe("AUTH-05: Current user without token", () => {
	test("Get current user without token returns 401", { tag: "@regression" }, async ({ authApi }) => {
		const response = await authApi.authentication.me();

		expect(response.status()).toBe(401);
	});
});

test.describe("AUTH-06: Current user with invalid token", () => {
	test("Get current user with invalid token returns 401", { tag: "@regression" }, async ({ invalidTokenApi }) => {
		const response = await invalidTokenApi.authentication.me();

		expect(response.status()).toBe(401);
	});
});

test.describe("AUTH-07: Users", () => {
	test("Get users with admin token returns user list", { tag: "@smoke" }, async ({ adminApi }) => {
		const response = await adminApi.authentication.getUsers(true);

		const users = usersResponseSchema.parse(await response.json());
		expect(users.length).toBeGreaterThan(0);
	});
});

test.describe("AUTH-08: Request without API key", () => {
	test("Get current user without API key returns 401", { tag: "@regression" }, async ({ noApiKeyApi }) => {
		const response = await noApiKeyApi.authentication.me();

		expect(response.status()).toBe(401);
	});
});
