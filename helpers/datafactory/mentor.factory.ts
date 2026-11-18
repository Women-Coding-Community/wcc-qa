import { faker } from "@faker-js/faker";
import { Month } from "helpers/datafactory/constants/cycle.data";
import { MIN_LONG_TERM_HOURS_PER_MENTEE, MAX_REJECTION_REASON_LENGTH } from "helpers/datafactory/constants/mentor.data";

export type MentorPayload = ReturnType<typeof buildMentorPayload> & { calendlyLink?: string };

export const buildCalendlyLink = () => `https://calendly.com/${faker.internet.username().toLowerCase()}`;

export type AdHocAvailability = { month: Month; hours: number };

export interface MentorOffer {
	longTerm?: boolean;
	adHoc?: AdHocAvailability[];
}

export const buildLongTermCommitment = () => {
	const numMentee = faker.number.int({ min: 1, max: 3 });
	return { numMentee, hours: numMentee * MIN_LONG_TERM_HOURS_PER_MENTEE };
};

export const buildAdHocAvailability = (month: Month, hours: number): AdHocAvailability[] => [{ month, hours }];

export const buildRejectionReason = () => ({
	reason: faker.lorem.sentence().slice(0, MAX_REJECTION_REASON_LENGTH),
});

export const buildMentorPayload = ({ longTerm = true, adHoc }: MentorOffer = {}) => ({
	fullName: faker.person.fullName(),
	email: faker.internet.email({ provider: "automation.test" }).toLowerCase(),
	position: faker.person.jobTitle(),
	slackDisplayName: faker.internet.username().toLowerCase().slice(0, 20),
	bio: faker.lorem.sentences(2),
	country: { countryCode: "GB", countryName: "United Kingdom" },
	memberTypes: ["MENTOR"],
	skills: {
		yearsExperience: faker.number.int({ min: 1, max: 20 }),
		areas: [{ technicalArea: "Backend", proficiencyLevel: "ADVANCED" }],
		languages: [{ language: "Python", proficiencyLevel: "ADVANCED" }],
		mentorshipFocus: ["Grow from beginner to mid-level"],
	},
	menteeSection: {
		idealMentee: faker.lorem.sentence(),
		...(longTerm && { longTerm: buildLongTermCommitment() }),
		...(adHoc && { adHoc }),
	},
});
