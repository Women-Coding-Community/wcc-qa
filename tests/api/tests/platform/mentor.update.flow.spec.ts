import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { MentorResponse, mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";

let original: MentorResponse | undefined;

test.beforeEach(async ({ authApi }) => {
	const response = await authApi.mentor.registerWithCalendlyLink(true);
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

// FIXME: re-registering an existing email overwrites member-level fields with the new request's values,
// so an omitted calendlyLink is wiped (MentorshipService.create builds the merge from the request). Unskip once fixed.
test.skip(
	"MENTOR-U02: Re-registering an existing email keeps member-level fields and applies the changed ones",
	{ tag: "@regression" },
	async ({ authApi, mentorshipAdminApi }) => {
		expect(original!.calendlyLink).toBeDefined();

		const response = await authApi.mentor.reRegister(original!.email);
		expect(response.status()).toBe(201);
		expect(mentorResponseSchema.parse(await response.json()).id).toBe(original!.id);

		const readBack = mentorResponseSchema.parse(
			await (await mentorshipAdminApi.mentor.getById(original!.id, true)).json()
		);
		expect(readBack.bio).not.toBe(original!.bio);
		expect(readBack.calendlyLink).toBe(original!.calendlyLink);
	}
);
