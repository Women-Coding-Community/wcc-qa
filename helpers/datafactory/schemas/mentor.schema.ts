import { z } from 'zod';

export const profileStatusSchema = z.enum(['ACTIVE', 'DISABLED', 'BANNED', 'PENDING', 'REJECTED']);

export const mentorResponseSchema = z.object({
  id: z.number(),
  email: z.email(),
  fullName: z.string(),
  position: z.string(),
  slackDisplayName: z.string(),
  bio: z.string(),
  profileStatus: profileStatusSchema,
  country: z.object({
    countryCode: z.string(),
    countryName: z.string(),
  }),
  memberTypes: z.array(z.string()),
  skills: z.object({
    yearsExperience: z.number(),
    areas: z.array(z.object({
      technicalArea: z.string(),
      proficiencyLevel: z.string(),
    })),
    languages: z.array(z.object({
      language: z.string(),
      proficiencyLevel: z.string(),
    })),
    mentorshipFocus: z.array(z.string()),
  }),
  menteeSection: z.object({
    idealMentee: z.string(),
    additional: z.string().optional().nullable(),
  }),
  city: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  pronounCategory: z.string().optional().nullable(),
  isWomen: z.boolean().optional().nullable(),
  calendlyLink: z.string().optional().nullable(),
  acceptMale: z.boolean().optional().nullable(),
  acceptPromotion: z.boolean().optional().nullable(),
  spokenLanguages: z.array(z.string()).optional().nullable(),
});

export type MentorResponse = z.infer<typeof mentorResponseSchema>;

/**
 * Lightweight shape for items returned by the mentor list endpoint.
 * The list intentionally validates only the fields the flows rely on
 * (extra keys are stripped, not rejected) since the list payload is
 * lighter than the full mentor response.
 */
export const mentorSummarySchema = z.object({
  id: z.number(),
  email: z.email(),
  fullName: z.string(),
  profileStatus: profileStatusSchema,
});

export const mentorListSchema = z.array(mentorSummarySchema);

export type MentorSummary = z.infer<typeof mentorSummarySchema>;
