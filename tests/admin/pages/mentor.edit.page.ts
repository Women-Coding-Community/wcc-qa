import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class MentorEditPage extends BasePage {
	readonly heading: Locator;
	readonly changePictureButton: Locator;
	readonly fileInput: Locator;
	readonly saveProfileButtons: Locator;
	readonly successAlert: Locator;
	readonly errorAlert: Locator;
	readonly avatarImage: Locator;
	readonly cityInput: Locator;
	readonly mentorshipTypeCombobox: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Profile Editor" });
		this.changePictureButton = page.getByRole("button", { name: /change picture/i });
		this.fileInput = page.locator('input[type="file"][accept="image/*"]');
		this.saveProfileButtons = page.getByRole("button", { name: /save profile/i });
		this.successAlert = page.locator(".MuiAlert-standardSuccess, [role='alert']:has-text('successfully')");
		this.errorAlert = page.locator(".MuiAlert-standardError");
		this.avatarImage = page.locator(".MuiAvatar-root img");
		this.cityInput = page.getByRole("textbox", { name: "City" });
		this.mentorshipTypeCombobox = page.getByRole("combobox", { name: "Mentorship Type" });
	}

	async uploadProfilePicture(filePath: string): Promise<void> {
		await this.fileInput.setInputFiles(filePath);
	}

	async fillRequiredFieldsIfEmpty(): Promise<void> {
		const currentCity = await this.cityInput.inputValue();
		if (!currentCity) {
			await this.cityInput.fill("London");
		}
		const hasType = await this.page
			.locator(".MuiChip-label:has-text('Long Term'), .MuiChip-label:has-text('Ad Hoc')")
			.count();
		if (hasType === 0) {
			await this.mentorshipTypeCombobox.click();
			await this.page.getByRole("option", { name: /long term/i }).click();
		}
	}

	async saveProfile(): Promise<void> {
		await this.saveProfileButtons.first().click();
	}
}
