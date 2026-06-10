import { test as base } from "@playwright/test";
import { BasePage } from "tests/admin/pages/base.page";
import { LoginPage } from "tests/admin/pages/login.page";

export interface POMFixtures {
	basePage: BasePage;
	loginPage: LoginPage;
}

export const test = base.extend<POMFixtures>({
	basePage: async ({ page }, use) => {
		await use(new BasePage(page));
	},
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
});
