import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";
import { mentorshipCycleSchema } from "helpers/datafactory/schemas/cycle.schema";
import { cmsMentorsPageSchema } from "helpers/datafactory/schemas/cms.schema";
import { buildAdHocAvailability } from "helpers/datafactory/mentor.factory";
import { CycleMentorshipType, Month } from "helpers/datafactory/constants/cycle.data";
import { AD_HOC_HOURS } from "helpers/datafactory/constants/mentor.data";

let mentorId: number | undefined;

test.afterEach(async ({ adminApi }) => {
	if (mentorId === undefined) return;

	const response = await adminApi.member.delete(mentorId);
	expect(response.status()).toBe(204);

	mentorId = undefined;
});

test(
	"MENTOR-U03: An ad-hoc mentor available in the cycle month appears on the public list",
	{ tag: ["@regression", "@ad-hoc"] },
	async ({ authApi, mentorshipAdminApi }) => {
		const cycle = mentorshipCycleSchema.parse(await (await mentorshipAdminApi.cycle.current(true)).json());

		const registered = await authApi.mentor.registerWithOffer(
			{ longTerm: false, adHoc: buildAdHocAvailability(cycle.cycleMonth, AD_HOC_HOURS) },
			true
		);

		mentorId = mentorResponseSchema.parse(await registered.json()).id;
		await mentorshipAdminApi.mentor.accept(mentorId, true);

		const page = cmsMentorsPageSchema.parse(
			await (await authApi.cms.mentorsByType(CycleMentorshipType.AD_HOC, true)).json()
		);
		const listed = page.mentors.find(m => m.id === mentorId);
		expect(listed?.menteeSection.adHoc).toContainEqual({ month: cycle.cycleMonth, hours: AD_HOC_HOURS });
	}
);

test(
	"MENTOR-U04: An ad-hoc mentor not available in the cycle month is absent from the public list",
	{ tag: ["@regression", "@ad-hoc"] },
	async ({ authApi, mentorshipAdminApi }) => {
		const cycle = mentorshipCycleSchema.parse(await (await mentorshipAdminApi.cycle.current(true)).json());
		const otherMonth = Object.values(Month).find(m => m !== cycle.cycleMonth)!;

		const registered = await authApi.mentor.registerWithOffer(
			{ longTerm: false, adHoc: buildAdHocAvailability(otherMonth, AD_HOC_HOURS) },
			true
		);

		mentorId = mentorResponseSchema.parse(await registered.json()).id;
		await mentorshipAdminApi.mentor.accept(mentorId, true);

		const page = cmsMentorsPageSchema.parse(
			await (await authApi.cms.mentorsByType(CycleMentorshipType.AD_HOC, true)).json()
		);
		expect(page.mentors.find(m => m.id === mentorId)).toBeUndefined();
	}
);
