import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "tests/.env"), quiet: true });

/** Shared by the admin reachability, login setup, and admin test projects. */
const adminUse = {
	...devices["Desktop Safari"],
	baseURL: process.env.ADMIN_BASE_URL || "http://localhost:3000",
};

/**
 * Projects — two phases, because the Docker stack has one mentorship cycle open at a time:
 *
 *   base phase (long-term, as seeded)     every test NOT tagged @ad-hoc
 *     admin_reachability  verifies the login route is available before setup
 *     setup          logs every role into the admin portal and saves the sessions; depends on admin_reachability
 *     api            needs only the backend
 *     admin          needs the backend + admin portal; depends on setup
 *
 *   ad-hoc phase (after the base phase)   only tests tagged @ad-hoc
 *     setup_ad_hoc   switches the stack to the ad-hoc cycle (Docker + wcc-backend checkout)
 *     api_ad_hoc, admin_ad_hoc
 *     restore_cycle  teardown: switches back to long-term
 *
 * Untagged = cycle-agnostic. `@long-term` is documentary only (the base phase is long-term anyway).
 * If any base-phase test fails, Playwright skips the ad-hoc phase (dependency semantics).
 */
export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	// `github` adds a failure annotation per test to the Actions run summary.
	reporter: process.env.CI
		? [["list"], ["github"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],
	use: {
		trace: "on-first-retry",
	},

	projects: [
		// ── base phase ──────────────────────────────────────────────────────────────
		{
			name: "admin_reachability",
			testMatch: /admin\/reachability\.setup\.ts/,
			use: adminUse,
			// Missing frontend is an environment failure; report it once.
			retries: 0,
		},
		{
			name: "setup",
			testMatch: /admin\/setup\.ts/,
			use: adminUse,
			dependencies: ["admin_reachability"],
		},
		{
			name: "api",
			testDir: "./tests/api/tests",
			grepInvert: /@ad-hoc/,
			use: { baseURL: process.env.API_HOST },
		},
		{
			name: "admin",
			testDir: "./tests/admin/tests",
			grepInvert: /@ad-hoc/,
			use: adminUse,
			dependencies: ["setup"],
		},

		// ── ad-hoc phase ────────────────────────────────────────────────────────────
		{
			name: "setup_ad_hoc",
			testMatch: /cycle\.ad-hoc\.setup\.ts/,
			dependencies: ["api", "admin"],
			teardown: "restore_cycle",
		},
		{
			name: "api_ad_hoc",
			testDir: "./tests/api/tests",
			grep: /@ad-hoc/,
			use: { baseURL: process.env.API_HOST },
			dependencies: ["setup_ad_hoc"],
		},
		{
			name: "admin_ad_hoc",
			testDir: "./tests/admin/tests",
			grep: /@ad-hoc/,
			use: adminUse,
			dependencies: ["setup_ad_hoc"],
		},
		{
			name: "restore_cycle",
			testMatch: /cycle\.restore\.setup\.ts/,
		},
	],
});
