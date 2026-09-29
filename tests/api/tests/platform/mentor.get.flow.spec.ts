import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorListSchema, mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";
import { meResponseSchema } from "helpers/datafactory/schemas/auth.schema";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { NON_EXISTENT_MENTOR_ID, NON_NUMERIC_MENTOR_ID } from "helpers/datafactory/constants/mentor.data";

/**
 * Role matrix for reading mentors. Cross-cutting rejections (missing API key,
 * invalid token) are covered once in the auth flow (AUTH-05/06/08), not per endpoint:
 * an invalid token is treated as anonymous, so it lands on the same rule as "no token".
 */

// ── GET /mentors ───────────────────────────────────────────────────────────────

const LIST_ALLOWED_ROLES: { id: string; role: Role }[] = [
	{ id: "MENTOR-G01", role: Role.ADMIN },
	{ id: "MENTOR-G02", role: Role.LEADER },
	{ id: "MENTOR-G03", role: Role.MENTORSHIP_ADMIN },
];

for (const { id, role } of LIST_ALLOWED_ROLES) {
	test.describe(`${id}: Get mentors as ${role}`, () => {
		test(`Get mentors with ${role} token returns mentor list`, { tag: "@smoke" }, async ({ apiForRole }) => {
			const api = await apiForRole(role);
			const response = await api.mentor.list(true);

			const mentors = mentorListSchema.parse(await response.json());
			expect(mentors.length).toBeGreaterThan(0);
		});
	});
}

test.describe("MENTOR-G04: Get mentors as mentor", () => {
	test("Get mentors with mentor token returns 403", { tag: "@regression" }, async ({ mentorApi }) => {
		const response = await mentorApi.mentor.list();

		expect(response.status()).toBe(403);
	});
});

test.describe("MENTOR-G05: Get mentors without token", () => {
	test("Get mentors without token returns 403", { tag: "@regression" }, async ({ authApi }) => {
		const response = await authApi.mentor.list();

		expect(response.status()).toBe(403);
	});
});

// ── GET /mentors/{id} ──────────────────────────────────────────────────────────

/**
 * Staff roles by role, the mentor by ownership — all read the seeded mentor's own record
 * (backend: `requireSelfOrRoles(mentorId, ADMIN, LEADER, MENTORSHIP_ADMIN)`).
 */
const GET_BY_ID_ALLOWED_ROLES: { id: string; role: Role }[] = [
	{ id: "MENTOR-G06", role: Role.ADMIN },
	{ id: "MENTOR-G07", role: Role.LEADER },
	{ id: "MENTOR-G08", role: Role.MENTORSHIP_ADMIN },
	{ id: "MENTOR-G09", role: Role.MENTOR },
];

for (const { id, role } of GET_BY_ID_ALLOWED_ROLES) {
	test.describe(`${id}: Get mentor by id as ${role}`, () => {
		test(
			`Get mentor by id with ${role} token returns that mentor`,
			{ tag: "@smoke" },
			async ({ apiForRole, mentorApi }) => {
				const mentorId = await test.step("Given the seeded mentor's own member id", async () => {
					const response = await mentorApi.authentication.me(true);
					return meResponseSchema.parse(await response.json()).member.id;
				});

				await test.step(`When ${role} retrieves that mentor by id`, async () => {
					const api = await apiForRole(role);
					const response = await api.mentor.getById(mentorId, true);

					const mentor = mentorResponseSchema.parse(await response.json());
					expect(mentor.id).toBe(mentorId);
					expect(mentor.email).toBe(USERS[Role.MENTOR].email);
				});
			}
		);
	});
}

test.describe("MENTOR-G10: Mentor gets another mentor's profile", () => {
	let otherMentorId: number | undefined;

	test.beforeEach(async ({ authApi }) => {
		const response = await authApi.mentor.register(true);

		otherMentorId = mentorResponseSchema.parse(await response.json()).id;
	});

	test.afterEach(async ({ adminApi }) => {
		if (otherMentorId === undefined) return;

		const response = await adminApi.member.delete(otherMentorId);
		expect(response.status()).toBe(204);

		otherMentorId = undefined;
	});

	test("Mentor getting another mentor's profile returns 403", { tag: "@regression" }, async ({ mentorApi }) => {
		const response = await mentorApi.mentor.getById(otherMentorId!);

		expect(response.status()).toBe(403);
	});
});

/**
 * The authorization check runs before the record lookup, so the anonymous case uses a
 * non-existent id on purpose: the caller must be rejected without learning whether it exists.
 */
test.describe("MENTOR-G11: Get mentor by id without token", () => {
	test("Get mentor by id without token returns 403", { tag: "@regression" }, async ({ authApi }) => {
		const response = await authApi.mentor.getById(NON_EXISTENT_MENTOR_ID);

		expect(response.status()).toBe(403);
	});
});

test.describe("MENTOR-G12: Get mentor by non-existent id", () => {
	test("Get mentor by non-existent id returns 404", { tag: "@regression" }, async ({ adminApi }) => {
		const response = await adminApi.mentor.getById(NON_EXISTENT_MENTOR_ID);

		expect(response.status()).toBe(404);
	});
});

test.describe("MENTOR-G13: Get mentor by non-numeric id", () => {
	test("Get mentor by non-numeric id returns 400", { tag: "@regression" }, async ({ adminApi }) => {
		const response = await adminApi.mentor.getById(NON_NUMERIC_MENTOR_ID);

		expect(response.status()).toBe(400);
	});
});
