import { expect } from "@playwright/test";
import { test as setup } from "helpers/fixtures/common.fixtures";
import { CycleScenario, CYCLE_TYPE_OF_SCENARIO } from "helpers/datafactory/constants/cycle.data";
import { mentorshipCycleSchema } from "helpers/datafactory/schemas/cycle.schema";
import { switchCycle } from "helpers/environment/cycle.switch";

/**
 * `setup_ad_hoc` project: runs after the base suite, opens the ad-hoc cycle on the Docker
 * stack for the `@ad-hoc` tests, and proves the backend agrees. `restore_cycle` is its teardown.
 */
setup("open the ad-hoc mentorship cycle", async ({ adminApi }) => {
	await setup.step(`Given the stack is switched to the "${CycleScenario.AD_HOC}" cycle`, async () => {
		const cyclesTable = switchCycle(CycleScenario.AD_HOC);
		await setup.info().attach("cycles", { body: cyclesTable, contentType: "text/plain" });
	});

	await setup.step("Then the current cycle is the ad-hoc one", async () => {
		const response = await adminApi.cycle.current(true);
		const cycle = mentorshipCycleSchema.parse(await response.json());
		expect(cycle.mentorshipType).toBe(CYCLE_TYPE_OF_SCENARIO[CycleScenario.AD_HOC]);
	});
});
