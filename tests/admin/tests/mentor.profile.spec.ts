import { expect } from "@playwright/test";
import { test } from "helpers/fixtures";
import { USERS } from "helpers/datafactory/constants/roles.data";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

test.use({ storageState: USERS.admin.storageState });

test.describe("Mentor Profile & Picture Management", () => {
	let tempImagePath: string;

	test.beforeAll(() => {
		const sampleImage = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
			"base64"
		);
		tempImagePath = path.join(os.tmpdir(), `playwright-test-avatar-${Date.now()}.png`);
		fs.writeFileSync(tempImagePath, sampleImage);
	});

	test.afterAll(() => {
		if (fs.existsSync(tempImagePath)) {
			fs.unlinkSync(tempImagePath);
		}
	});

	test("Admin can upload mentor profile picture and save profile without error", async ({ page, mentorEditPage }) => {
		await mentorEditPage.navigateToURL("/admin/mentors/4");

		await expect(mentorEditPage.heading).toBeVisible();
		await expect(mentorEditPage.changePictureButton).toBeEnabled();

		// Listen for profile picture upload network response
		const uploadPromise = page.waitForResponse(
			res =>
				res.url().includes("/api/platform/v1/resources/member-profile-picture") && res.request().method() === "POST"
		);

		await mentorEditPage.uploadProfilePicture(tempImagePath);

		const uploadResponse = await uploadPromise;
		expect(uploadResponse.status()).toBe(201);

		// Verify no error alert is displayed
		await expect(mentorEditPage.errorAlert).toBeHidden();

		// Fill required form fields if empty so validation passes
		await mentorEditPage.fillRequiredFieldsIfEmpty();

		// Listen for save profile PUT response
		const savePromise = page.waitForResponse(
			res => res.url().includes("/api/platform/v1/mentors/4") && res.request().method() === "PUT"
		);

		await mentorEditPage.saveProfile();

		const saveResponse = await savePromise;
		expect(saveResponse.status()).toBe(200);

		// Verify success alert is shown
		await expect(mentorEditPage.successAlert).toBeVisible();
	});
});
