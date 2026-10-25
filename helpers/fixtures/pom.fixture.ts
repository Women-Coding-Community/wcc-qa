import { test as base } from "@playwright/test";
import { BasePage } from "tests/admin/pages/base.page";
import { DashboardPage } from "tests/admin/pages/dashboard.page";
import { LoginPage } from "tests/admin/pages/login.page";

export interface POMFixtures {
	basePage: BasePage;
	dashboardPage: DashboardPage;
	loginPage: LoginPage;
}

export const test = base.extend<POMFixtures>({
	basePage: async ({ page }, use) => {
		await use(new BasePage(page));
	},
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
});
