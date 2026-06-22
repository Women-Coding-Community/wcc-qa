import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { loginResponseSchema } from "helpers/datafactory/schemas/auth.schema";
import { usersResponseSchema } from "helpers/datafactory/schemas/user.account.schema";
import { USERS } from "helpers/datafactory/constants/roles.data";

test.describe("AUTH-01: Login", () => {
	// eslint-disable-next-line playwright/expect-expect -- schema.parse() throws on a malformed response, so it is the assertion.
	test("Login with valid credentials returns token", async ({ authApi }) => {
		const response = await authApi.authentication.login(USERS.admin.email, USERS.admin.password, true);

		// Schema parse verifies token, expiresAt, and roles are present and well-formed.
		loginResponseSchema.parse(await response.json());
	});
});

test.describe("AUTH-07: Users", () => {
	test("Get users with admin token returns user list", async ({ adminApi }) => {
		const response = await adminApi.authentication.getUsers(true);

		const users = usersResponseSchema.parse(await response.json());
		expect(users.length).toBeGreaterThan(0);
	});
});
