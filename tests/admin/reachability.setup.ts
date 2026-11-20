import { expect, test as setup } from "@playwright/test";
import { ADMIN_REACHABILITY_TIMEOUT_MS } from "helpers/datafactory/constants/environment.data";
import { LoginPage } from "tests/admin/pages/login.page";

setup("check admin frontend reachability", async ({ request, baseURL }) => {
	const url = new URL(LoginPage.path, baseURL);
	const route = url.origin + url.pathname;
	const help = "Check ADMIN_BASE_URL and start the application stack with npm run env:up.";
	const response = await request
		.get(url.toString(), {
			timeout: ADMIN_REACHABILITY_TIMEOUT_MS,
			maxRedirects: 0,
			failOnStatusCode: false,
		})
		.catch(() => {
			throw new Error("Admin frontend is unreachable at " + route + ". " + help);
		});

	expect(
		response.ok(),
		"Admin frontend at " + route + " answered " + response.status() + ", expected 2xx. " + help
	).toBe(true);
});
