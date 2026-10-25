import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
	static readonly path = "/admin";

	readonly heading: Locator;
	readonly navLinks: Locator;
	readonly logoutButton: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Dashboard" });
		this.navLinks = page.getByRole("banner").getByRole("link");
		this.logoutButton = page.getByRole("banner").getByRole("button", { name: "Logout" });
	}

	async logout(): Promise<void> {
		await this.logoutButton.click();
	}
}
