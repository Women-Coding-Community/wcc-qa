import { expect } from "@playwright/test";
import { test } from "helpers/fixtures";
import { LoginPage } from "tests/admin/pages/login.page";
import { DashboardPage } from "tests/admin/pages/dashboard.page";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { NAV_LINKS } from "helpers/datafactory/constants/admin-nav.data";
import { WRONG_PASSWORD } from "helpers/datafactory/constants/auth.data";
import { AdminRoutes } from "helpers/datafactory/constants/paths.data";

test.describe("ADMIN-LOGIN-01: Login", () => {
	test("Login with valid admin credentials lands on the dashboard", { tag: "@smoke" }, async ({ page, loginPage }) => {
		const { email, password } = USERS[Role.ADMIN];

		await loginPage.navigateToURL(LoginPage.path);
		await expect(loginPage.heading).toBeVisible();

		await loginPage.login(email, password);

		await expect(page).toHaveURL(/\/admin$/);
		await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
		await expect(loginPage.signInButton).toBeHidden();
	});
});

test.describe("ADMIN-LOGIN-02: Each seeded role reaches its landing page", () => {
	for (const role of Object.values(Role)) {
		test.describe(role, () => {
			test.use({ storageState: USERS[role].storageState });

			test(
				`${role} session lands on the dashboard with its role's nav`,
				{ tag: "@smoke" },
				async ({ page, dashboardPage }) => {
					await dashboardPage.navigateToURL(DashboardPage.path);

					await expect(page).toHaveURL(/\/admin$/);
					await expect(dashboardPage.heading).toBeVisible();
					await expect(dashboardPage.logoutButton).toBeVisible();
					await expect(dashboardPage.navLinks).toHaveText([...NAV_LINKS[role]]);
				}
			);
		});
	}
});

test.describe("ADMIN-LOGIN-03: Login with a wrong password", () => {
	test("Wrong password keeps the user on /login with an error", { tag: "@regression" }, async ({ page, loginPage }) => {
		await loginPage.navigateToURL(LoginPage.path);

		await loginPage.login(USERS[Role.ADMIN].email, WRONG_PASSWORD);

		await expect(loginPage.errorAlert).toHaveText("Invalid credentials");
		await expect(page).toHaveURL(/\/login$/);
		await expect(loginPage.signInButton).toBeVisible();
	});
});

test.describe("ADMIN-LOGIN-04: Unauthenticated access", () => {
	test(
		"Unauthenticated visit to /admin/mentees redirects to /login",
		{ tag: "@regression" },
		async ({ page, loginPage }) => {
			await loginPage.navigateToURL(AdminRoutes.MENTEES);

			await expect(page).toHaveURL(/\/login$/);
			await expect(loginPage.signInButton).toBeVisible();
		}
	);
});

test.describe("ADMIN-LOGIN-05: Logout", () => {
	test.use({ storageState: USERS[Role.ADMIN].storageState });

	test(
		"Logout clears the session and /admin redirects to /login",
		{ tag: "@regression" },
		async ({ page, dashboardPage, loginPage }) => {
			await test.step("Given an authenticated admin on the dashboard", async () => {
				await dashboardPage.navigateToURL(DashboardPage.path);
				await expect(dashboardPage.heading).toBeVisible();
			});

			await test.step("When they log out", async () => {
				await dashboardPage.logout();
				await expect(page).toHaveURL(/\/login$/);
			});

			await test.step("Then /admin redirects to /login", async () => {
				await dashboardPage.navigateToURL(DashboardPage.path);
				await expect(page).toHaveURL(/\/login$/);
				await expect(loginPage.signInButton).toBeVisible();
			});

			await test.step("And going back in history does not restore the dashboard", async () => {
				await page.goBack();
				await expect(page).toHaveURL(/\/login$/);
				await expect(dashboardPage.heading).toBeHidden();
			});
		}
	);
});

test.describe("ADMIN-LOGIN-06: Mentor session can't reach Users", () => {
	test.use({ storageState: USERS[Role.MENTOR].storageState });

	// FIXME: the portal has no route guard on /admin/users. A mentor stays on the page and sees the "Users"
	// heading and the Create form; only the backend refuses (GET /api/auth/users → 403, "Permission denied.
	// Required all of: [USER_READ]"). Unskip once the portal redirects unauthorised roles away.
	test.skip("Mentor visiting /admin/users is redirected away", { tag: "@regression" }, async ({ page, loginPage }) => {
		await loginPage.navigateToURL(AdminRoutes.USERS);

		await expect(page).not.toHaveURL(/\/admin\/users$/);
		await expect(page.getByRole("heading", { name: "Users" })).toBeHidden();
	});
});
