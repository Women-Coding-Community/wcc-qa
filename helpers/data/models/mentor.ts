import { z } from 'zod';

export const mentorLanguageSchema = z.object({
  language: z.string(),
  proficiencyLevel: z.string(),
});

export const mentorImageSchema = z.object({
  path: z.string(),
  alt: z.string(),
  type: z.string(),
});

export const apiMentorSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  position: z.string(),
  companyName: z.string(),
  profileStatus: z.string(),
  skills: z.object({
    languages: z.array(mentorLanguageSchema),
  }),
  images: z.array(mentorImageSchema),
});

export const mentorsApiBodySchema = z.object({
  mentors: z.array(apiMentorSchema),
});

export type ApiMentor = z.infer<typeof apiMentorSchema>;
export type MentorsApiBody = z.infer<typeof mentorsApiBodySchema>;
