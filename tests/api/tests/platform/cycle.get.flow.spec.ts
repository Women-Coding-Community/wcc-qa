import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorshipCycleSchema, mentorshipCyclesSchema } from "helpers/datafactory/schemas/cycle.schema";
import { cmsMentorsPageSchema } from "helpers/datafactory/schemas/cms.schema";
import { CycleScenario, CYCLE_TYPE_OF_SCENARIO } from "helpers/datafactory/constants/cycle.data";
import { Role } from "helpers/datafactory/constants/roles.data";

/**
 * Admin cycle endpoints. The stack has one cycle open at a time (`npm run env:up` seeds
 * long-term; `npm run env:cycle -- ad-hoc` switches). CYCLE-01..07 hold for whichever is
 * open; CYCLE-08/09 pin the type and carry the cycle tag that puts them in the matching phase.
 *
 * `/cycles/current` and `/cycles/all` share one rule (ADMIN or MENTORSHIP_ADMIN), so the
 * role matrix is asserted on `current` only; `all` gets its happy path.
 */

// ── GET /cycles/current ────────────────────────────────────────────────────────

const CURRENT_ALLOWED_ROLES: { id: string; role: Role }[] = [
	{ id: "CYCLE-01", role: Role.ADMIN },
	{ id: "CYCLE-02", role: Role.MENTORSHIP_ADMIN },
];

for (const { id, role } of CURRENT_ALLOWED_ROLES) {
	test.describe(`${id}: Get current cycle as ${role}`, () => {
		test(`Get current cycle with ${role} token returns the open cycle`, { tag: "@smoke" }, async ({ apiForRole }) => {
			const api = await apiForRole(role);
			const response = await api.cycle.current(true);

			const cycle = mentorshipCycleSchema.parse(await response.json());
			expect(cycle.status).toBe("OPEN");
			expect(cycle.registrationOpen).toBe(true);
		});
	});
}

const CURRENT_DENIED_ROLES: { id: string; role: Role }[] = [
	{ id: "CYCLE-03", role: Role.MENTOR },
	{ id: "CYCLE-04", role: Role.LEADER },
];

for (const { id, role } of CURRENT_DENIED_ROLES) {
	test.describe(`${id}: Get current cycle as ${role}`, () => {
		test(`Get current cycle with ${role} token returns 403`, { tag: "@regression" }, async ({ apiForRole }) => {
			const api = await apiForRole(role);
			const response = await api.cycle.current();

			expect(response.status()).toBe(403);
		});
	});
}

test.describe("CYCLE-05: Get current cycle without token", () => {
	test("Get current cycle without token returns 403", { tag: "@regression" }, async ({ authApi }) => {
		const response = await authApi.cycle.current();

		expect(response.status()).toBe(403);
	});
});

// ── GET /cycles/all ────────────────────────────────────────────────────────────

test.describe("CYCLE-06: Get all cycles as admin", () => {
	test("Get all cycles with admin token returns the cycle list", { tag: "@smoke" }, async ({ adminApi }) => {
		const response = await adminApi.cycle.all(true);

		const cycles = mentorshipCyclesSchema.parse(await response.json());
		expect(cycles.length).toBeGreaterThan(0);
	});
});

// ── Consistency across endpoints ───────────────────────────────────────────────

test.describe("CYCLE-07: Public mentors page reports the current cycle", () => {
	test(
		"Public mentors page openCycle matches the admin current cycle",
		{ tag: "@smoke" },
		async ({ adminApi, authApi }) => {
			const mentorshipType = await test.step("Given the current cycle's type", async () => {
				const response = await adminApi.cycle.current(true);
				return mentorshipCycleSchema.parse(await response.json()).mentorshipType;
			});

			await test.step("Then the public mentors page reports it as active", async () => {
				const response = await authApi.cms.mentors(true);
				const { openCycle } = cmsMentorsPageSchema.parse(await response.json());
				expect(openCycle).toEqual({ mentorshipType, active: true });
			});
		}
	);
});

/** One case per cycle; the tag selects the phase (playwright.config.ts) whose setup opens that cycle. */
const CURRENT_BY_SCENARIO: { id: string; scenario: CycleScenario; tag: string }[] = [
	{ id: "CYCLE-08", scenario: CycleScenario.LONG_TERM, tag: "@long-term" },
	{ id: "CYCLE-09", scenario: CycleScenario.AD_HOC, tag: "@ad-hoc" },
];

for (const { id, scenario, tag } of CURRENT_BY_SCENARIO) {
	const type = CYCLE_TYPE_OF_SCENARIO[scenario];

	test.describe(`${id}: Current cycle when the ${type} cycle is open`, () => {
		test(`Current cycle is the open ${type} cycle`, { tag: ["@regression", tag] }, async ({ adminApi }) => {
			const openCycle = await test.step(`Given only the ${type} cycle is open for registration`, async () => {
				const response = await adminApi.cycle.all(true);
				const open = mentorshipCyclesSchema.parse(await response.json()).filter(cycle => cycle.registrationOpen);

				const hint = `expected only the ${type} cycle to be open — run: npm run env:cycle -- ${scenario}`;
				expect(open, hint).toHaveLength(1);
				expect(open[0].mentorshipType, hint).toBe(type);
				return open[0];
			});

			await test.step("Then the current cycle is exactly that one", async () => {
				const response = await adminApi.cycle.current(true);
				const current = mentorshipCycleSchema.parse(await response.json());
				expect(current.cycleId).toBe(openCycle.cycleId);
				expect(current.mentorshipType).toBe(type);
			});
		});
	});
}
