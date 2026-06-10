import { faker } from "@faker-js/faker";

export type MentorPayload = ReturnType<typeof buildMentorPayload>;

export const buildMentorPayload = () => ({
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
	},
});
