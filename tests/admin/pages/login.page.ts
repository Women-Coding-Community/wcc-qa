import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
	static readonly path = "/login";

	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly signInButton: Locator;
	readonly errorAlert: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Women Coding Community" });
		this.emailInput = page.getByRole("textbox", { name: "Email" });
		this.passwordInput = page.getByRole("textbox", { name: "Password" });
		this.signInButton = page.getByRole("button", { name: "Sign In" });
		// Next.js renders its route announcer with role="alert" too; exclude it so this matches the form error only.
		this.errorAlert = page.getByRole("alert").and(page.locator(":not(#__next-route-announcer__)"));
	}

	async login(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.signInButton.click();
	}
}
