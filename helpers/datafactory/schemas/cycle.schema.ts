import { z } from "zod";
import { CycleMentorshipType } from "helpers/datafactory/constants/cycle.data";

/** Lifecycle of a mentorship cycle as returned by the admin cycle endpoints. */
export const cycleStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

/**
 * A mentorship cycle from `GET /api/platform/v1/admin/mentorship/cycles/*`.
 * `mentorshipType` is the display name ("Long-Term" / "Ad-Hoc"), not the enum constant.
 */
export const mentorshipCycleSchema = z.object({
	cycleId: z.number(),
	cycleYear: z.number(),
	mentorshipType: z.enum(CycleMentorshipType),
	cycleMonth: z.string(),
	registrationStartDate: z.iso.date(),
	registrationEndDate: z.iso.date(),
	cycleStartDate: z.iso.date(),
	cycleEndDate: z.iso.date().nullable(),
	status: cycleStatusSchema,
	maxMenteesPerMentor: z.number(),
	description: z.string().nullable(),
	registrationOpen: z.boolean(),
});

export const mentorshipCyclesSchema = z.array(mentorshipCycleSchema);

export type MentorshipCycle = z.infer<typeof mentorshipCycleSchema>;
