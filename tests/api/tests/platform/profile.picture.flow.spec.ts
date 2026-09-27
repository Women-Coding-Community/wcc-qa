import { expect } from "@playwright/test";
import { test } from "helpers/fixtures/common.fixtures";
import { mentorResponseSchema } from "helpers/datafactory/schemas/mentor.schema";
import { memberProfilePictureSchema } from "helpers/datafactory/schemas/resource.schema";

test.describe("Mentor — Profile Picture Upload and Management Flow", () => {
	let mentorId: number | undefined;

	// Minimal 1x1 valid PNG image buffer
	const sampleImage1 = Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		"base64"
	);

	// Minimal 1x1 valid JPEG image buffer
	const sampleImage2 = Buffer.from(
		"/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
		"base64"
	);

	test.beforeEach(async ({ authApi }) => {
		const response = await authApi.mentor.register();
		expect(response.status()).toBe(201);

		const mentor = mentorResponseSchema.parse(await response.json());
		mentorId = mentor.id;
	});

	test.afterEach(async ({ adminApi }) => {
		if (mentorId === undefined) return;

		const response = await adminApi.member.delete(mentorId);
		expect(response.status()).toBe(204);

		mentorId = undefined;
	});

	test("Mentor profile picture can be uploaded, fetched, replaced without deletion error, and deleted", async ({
		adminApi,
	}) => {
		let firstDriveLink: string;
		let secondDriveLink: string;

		await test.step("PIC-01: Upload initial profile picture returns 201 and drive link", async () => {
			const response = await adminApi.resource.uploadProfilePicture(
				mentorId!,
				sampleImage1,
				"avatar1.png",
				"image/png"
			);
			expect(response.status()).toBe(201);

			const picture = memberProfilePictureSchema.parse(await response.json());
			expect(picture.memberId).toBe(mentorId);
			expect(picture.resource.driveFileLink).toContain("drive.google.com");
			firstDriveLink = picture.resource.driveFileLink;
		});

		await test.step("PIC-02: Get profile picture returns 200 and matches uploaded link", async () => {
			const response = await adminApi.resource.getProfilePicture(mentorId!);
			expect(response.status()).toBe(200);

			const picture = memberProfilePictureSchema.parse(await response.json());
			expect(picture.memberId).toBe(mentorId);
			expect(picture.resource.driveFileLink).toBe(firstDriveLink);
		});

		await test.step("PIC-03: Replace profile picture deletes old file from Google Drive and uploads new one", async () => {
			const response = await adminApi.resource.uploadProfilePicture(
				mentorId!,
				sampleImage2,
				"avatar2.jpg",
				"image/jpeg"
			);
			expect(response.status()).toBe(201);

			const picture = memberProfilePictureSchema.parse(await response.json());
			expect(picture.memberId).toBe(mentorId);
			expect(picture.resource.driveFileLink).toContain("drive.google.com");
			secondDriveLink = picture.resource.driveFileLink;
			expect(secondDriveLink).not.toBe(firstDriveLink);
		});

		await test.step("PIC-04: Delete profile picture removes file and returns 204", async () => {
			const response = await adminApi.resource.deleteProfilePicture(mentorId!);
			expect(response.status()).toBe(204);
		});

		await test.step("PIC-05: Get profile picture after deletion returns 404", async () => {
			const response = await adminApi.resource.getProfilePicture(mentorId!);
			expect(response.status()).toBe(404);
		});
	});
});
