import { execFileSync } from "node:child_process";
import path from "node:path";
import { CycleScenario, CYCLE_SWITCH_TIMEOUT_MS } from "helpers/datafactory/constants/cycle.data";

/** The wcc-backend checkout that owns the Docker stack: a sibling directory unless WCC_BACKEND_DIR says otherwise. */
const BACKEND_DIR = path.resolve(__dirname, "..", "..", process.env.WCC_BACKEND_DIR ?? "../wcc-backend");
const APP_STACK = path.join(BACKEND_DIR, "scripts", "app-stack.sh");

/**
 * Opens the given cycle on the local Docker stack (`app-stack.sh cycle <scenario>`), closing
 * every other one. This changes the database every worker shares, so only the phase setups
 * call it (tests/cycle.*.setup.ts) — never a test.
 *
 * @returns the script's stdout (the resulting cycles table), handy to attach to the report
 */
export function switchCycle(scenario: CycleScenario): string {
	try {
		return execFileSync(APP_STACK, ["cycle", scenario], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
			timeout: CYCLE_SWITCH_TIMEOUT_MS,
		});
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Could not switch the mentorship cycle to "${scenario}" with ${APP_STACK}.\n` +
				`Is the stack running (npm run env:up) and is wcc-backend checked out next to this repo (or WCC_BACKEND_DIR set)?\n${detail}`
		);
	}
}
