import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { MentorResponse, mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";

let original: MentorResponse | undefined;

test.beforeEach(async ({ authApi }) => {
	const response = await authApi.mentor.register(true);
	original = mentorResponseSchema.parse(await response.json());
});

test.afterEach(async ({ adminApi }) => {
	if (original === undefined) return;

	const response = await adminApi.member.delete(original.id);
	expect(response.status()).toBe(204);

	original = undefined;
});

test(
	"MENTOR-U01: Updating a mentor persists the changed fields",
	{ tag: "@regression" },
	async ({ mentorshipAdminApi }) => {
		const response = await mentorshipAdminApi.mentor.update(original!.id, original!.email);
		expect(response.status()).toBe(200);

		const updated = mentorResponseSchema.parse(await response.json());
		expect(updated.bio).not.toBe(original!.bio);

		const readBack = mentorResponseSchema.parse(
			await (await mentorshipAdminApi.mentor.getById(original!.id, true)).json()
		);
		expect(readBack.bio).toBe(updated.bio);
	}
);
