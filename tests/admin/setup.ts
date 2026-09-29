import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { LoginPage } from "tests/admin/pages/login.page";

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
