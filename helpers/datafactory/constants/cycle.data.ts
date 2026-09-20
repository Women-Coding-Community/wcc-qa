/** `mentorshipType` as the backend serialises it on a mentorship cycle (its display name). */
export enum CycleMentorshipType {
	LONG_TERM = "Long-Term",
	AD_HOC = "Ad-Hoc",
}

/**
 * Argument of `npm run env:cycle -- <scenario>` (wcc-backend's `app-stack.sh cycle`) that
 * opens the matching cycle for today and closes every other one.
 */
export enum CycleScenario {
	LONG_TERM = "long-term",
	AD_HOC = "ad-hoc",
}

/** `npm run env:up` seeds this one; specs that switch the cycle restore it when they are done. */
export const DEFAULT_CYCLE_SCENARIO = CycleScenario.LONG_TERM;

/** Which cycle type a scenario leaves open. */
export const CYCLE_TYPE_OF_SCENARIO: Record<CycleScenario, CycleMentorshipType> = {
	[CycleScenario.LONG_TERM]: CycleMentorshipType.LONG_TERM,
	[CycleScenario.AD_HOC]: CycleMentorshipType.AD_HOC,
};

/** Upper bound for one `app-stack.sh cycle` run; the first call also builds the small seed image. */
export const CYCLE_SWITCH_TIMEOUT_MS = 120_000;
