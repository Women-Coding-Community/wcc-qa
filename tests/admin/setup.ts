import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { USERS, type Role } from "helpers/datafactory/constants/roles.data";
import { LoginPage } from "tests/admin/pages/login.page";

const BASE_URL = process.env.ADMIN_BASE_URL ?? "http://localhost:3000";

setup("authenticate roles", async ({ browser }) => {
	for (const role of Object.keys(USERS) as Role[]) {
		const { email, password, storageState } = USERS[role];

		const context = await browser.newContext({ baseURL: BASE_URL });
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
