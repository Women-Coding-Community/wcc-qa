import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";

let mentorId: number | undefined;

test.beforeEach(async ({ authApi }) => {
	const response = await authApi.mentor.register(true);
	mentorId = mentorResponseSchema.parse(await response.json()).id;
});

test.afterEach(async ({ adminApi }) => {
	if (mentorId === undefined) return;

	const response = await adminApi.member.delete(mentorId);
	expect(response.status()).toBe(204);

	mentorId = undefined;
});

test(
	"MENTOR-R01: Rejecting a pending mentor sets profileStatus to REJECTED",
	{ tag: "@regression" },
	async ({ mentorshipAdminApi }) => {
		const response = await mentorshipAdminApi.mentor.reject(mentorId!);

		expect(response.status()).toBe(200);

		const mentor = mentorResponseSchema.parse(await response.json());
		expect(mentor.profileStatus).toBe("REJECTED");
	}
);
