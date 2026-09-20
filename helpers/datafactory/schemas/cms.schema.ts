import { z } from "zod";
import { profileStatusSchema } from "./mentor.schema";
import { CycleMentorshipType } from "helpers/datafactory/constants/cycle.data";

/**
 * Lightweight shape for items in the public CMS mentors list.
 * Validates only the fields the mentorship flow relies on; the extra
 * keys returned by the CMS page payload are stripped, not rejected.
 */
export const cmsMentorSchema = z.object({
	id: z.number(),
	email: z.email(),
	fullName: z.string(),
	profileStatus: profileStatusSchema,
});

/**
 * The cycle currently open for registration as the public page reports it.
 * `mentorshipType` is absent when no cycle is open (`active: false`).
 */
export const cmsOpenCycleSchema = z.object({
	mentorshipType: z.enum(CycleMentorshipType).optional(),
	active: z.boolean(),
});

/** The public CMS mentors page wraps the mentor list under `mentors`. */
export const cmsMentorsPageSchema = z.object({
	mentors: z.array(cmsMentorSchema),
	openCycle: cmsOpenCycleSchema,
});

export type CmsMentor = z.infer<typeof cmsMentorSchema>;
export type CmsOpenCycle = z.infer<typeof cmsOpenCycleSchema>;
export type CmsMentorsPage = z.infer<typeof cmsMentorsPageSchema>;
