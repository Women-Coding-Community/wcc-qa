import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";
import { cmsMentorsPageSchema } from "helpers/datafactory/schemas/cms.schema";

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

test(
	"MENTOR-R02: Rejecting an active mentor removes them from the public CMS list",
	{ tag: "@regression" },
	async ({ mentorshipAdminApi, authApi }) => {
		await mentorshipAdminApi.mentor.accept(mentorId!, true);

		const before = cmsMentorsPageSchema.parse(await (await authApi.cms.mentors(true)).json());
		expect(before.mentors.find(m => m.id === mentorId)).toBeDefined();

		const response = await mentorshipAdminApi.mentor.reject(mentorId!);
		expect(response.status()).toBe(200);

		const after = cmsMentorsPageSchema.parse(await (await authApi.cms.mentors(true)).json());
		expect(after.mentors.find(m => m.id === mentorId)).toBeUndefined();
	}
);
