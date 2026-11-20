import { Role } from "./roles.data";

/**
 * Admin portal nav links each seeded role sees after a real login, in rendered order.
 * The portal derives them from the roles in the session, so a mismatch means the seed or the JWT claims are off.
 */
export const NAV_LINKS: Record<Role, readonly string[]> = {
	[Role.ADMIN]: ["Home", "Mentors", "Members", "Mentees", "Mentorship", "Cycles", "Users"],
	[Role.MENTORSHIP_ADMIN]: ["Home", "Mentors", "Members", "Mentees", "Mentorship", "Cycles"],
	[Role.LEADER]: ["Home", "Mentors", "Members", "Users"],
	[Role.MENTOR]: ["Home", "Mentor Dashboard", "My Profile"],
	[Role.MENTEE]: ["Home"],
	[Role.MENTOR_AD_HOC]: ["Home", "Mentor Dashboard", "My Profile"],
	[Role.MEMBER]: ["Home"],
};
