import { z } from "zod";
import { memberDtoSchema } from "./member.dto.schema";

export const roleTypeSchema = z.enum([
	"ADMIN",
	"LEADER",
	"MENTEE",
	"MENTOR",
	"MENTORSHIP_ADMIN",
	"CONTRIBUTOR",
	"VIEWER",
]);

export const loginResponseSchema = z.object({
	token: z.string().min(1),
	expiresAt: z.string().min(1),
	roles: z.array(roleTypeSchema).min(1),
	member: memberDtoSchema.optional().nullable(),
	message: z.string().optional().nullable(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * Shape returned by `GET /api/auth/me`. `member.id` is required here because the
 * endpoint always resolves the authenticated account to a member record.
 */
export const meResponseSchema = z.object({
	roles: z.array(roleTypeSchema).min(1),
	member: memberDtoSchema.extend({ id: z.number() }),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
