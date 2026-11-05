import { test as base } from "@playwright/test";
import { BasePage } from "tests/admin/pages/base.page";
import { DashboardPage } from "tests/admin/pages/dashboard.page";
import { LoginPage } from "tests/admin/pages/login.page";
import { MentorEditPage } from "tests/admin/pages/mentor.edit.page";

export interface POMFixtures {
	basePage: BasePage;
	dashboardPage: DashboardPage;
	loginPage: LoginPage;
	mentorEditPage: MentorEditPage;
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
	mentorEditPage: async ({ page }, use) => {
		await use(new MentorEditPage(page));
	},
});
