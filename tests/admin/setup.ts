import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { ADMIN_REACHABILITY_TIMEOUT_MS } from "helpers/datafactory/constants/environment.data";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { LoginPage } from "tests/admin/pages/login.page";

// A missing frontend is an environment failure, so report it once without retrying login.
setup.describe.configure({ retries: 0 });

setup.beforeAll(async ({ playwright, baseURL }) => {
	const request = await playwright.request.newContext();
	try {
		if (!baseURL) {
			throw new Error("Missing admin base URL");
		}
		const response = await request.get(baseURL, {
			timeout: ADMIN_REACHABILITY_TIMEOUT_MS,
			maxRedirects: 0,
			failOnStatusCode: false,
		});
		if (response.status() >= 500) {
			throw new Error("Admin frontend is not ready");
		}
	} catch {
		throw new Error(
			"Admin frontend is unreachable or not ready. Check ADMIN_BASE_URL and start the application stack with npm run env:up."
		);
	} finally {
		await request.dispose();
	}
});

/** Logs every role into the admin portal once and saves each session for the admin specs to reuse. */
setup("authenticate roles", async ({ browser, baseURL }) => {
	for (const role of Object.values(Role)) {
		const { email, password, storageState } = USERS[role];

		const context = await browser.newContext({ baseURL });
		const page = await context.newPage();
		const loginPage = new LoginPage(page);

		await loginPage.navigateToURL(LoginPage.path);
		await loginPage.login(email, password);

		await page.waitForURL("**/admin");
		await page.getByRole("heading", { name: "Dashboard" }).waitFor();

		fs.mkdirSync(path.dirname(storageState), { recursive: true });
		await context.storageState({ path: storageState });
		await context.close();
	}
});
