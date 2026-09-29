import { expect } from "@playwright/test";
import { test } from "helpers/fixtures";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";

test.use({ storageState: USERS[Role.MENTOR].storageState });

test.describe("Dashboard Page Test", () => {
	test("Dashboard loads after navigating to root", { tag: "@smoke" }, async ({ page, loginPage }) => {
		await loginPage.navigateToURL("/");

		await expect(page).toHaveURL(/\/admin$/);
		await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
	});
});
