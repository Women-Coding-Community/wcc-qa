/** Roles the test suite can authenticate as. Values are the keys of {@link USERS}. */
export enum Role {
	ADMIN = "admin",
	LEADER = "leader",
	MENTOR = "mentor",
	MENTORSHIP_ADMIN = "mentorshipAdmin",
}

export interface USER {
	email: string;
	password: string;
	/** Path to the saved Playwright storageState (login session) for this role. */
	storageState: string;
}

function getEnvVariable(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required env var "${name}" — check tests/.env`);
	}
	return value;
}

export const USERS: Record<Role, USER> = {
	[Role.ADMIN]: {
		email: getEnvVariable("ADMIN_EMAIL"),
		password: getEnvVariable("ADMIN_PASSWORD"),
		storageState: "tests/admin/.auth/admin.json",
	},
	[Role.MENTORSHIP_ADMIN]: {
		email: getEnvVariable("MENTORSHIP_ADMIN_EMAIL"),
		password: getEnvVariable("MENTORSHIP_ADMIN_PASSWORD"),
		storageState: "tests/admin/.auth/mentorship-admin.json",
	},
	[Role.MENTOR]: {
		email: getEnvVariable("MENTOR_EMAIL"),
		password: getEnvVariable("MENTOR_PASSWORD"),
		storageState: "tests/admin/.auth/mentor.json",
	},
	[Role.LEADER]: {
		email: getEnvVariable("LEADER_EMAIL"),
		password: getEnvVariable("LEADER_PASSWORD"),
		storageState: "tests/admin/.auth/leader.json",
	},
};
