import { z } from "zod";

export const memberProfilePictureSchema = z.object({
	memberId: z.number(),
	resourceId: z.string().uuid(),
	resource: z.object({
		id: z.string().uuid(),
		fileName: z.string().optional(),
		contentType: z.string().optional(),
		driveFileId: z.string().optional(),
		driveFileLink: z.string().url(),
		resourceType: z.string(),
	}),
});

export type MemberProfilePicture = z.infer<typeof memberProfilePictureSchema>;
