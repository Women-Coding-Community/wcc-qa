import { Role } from "./roles.data";

/**
 * Admin portal nav links each seeded role sees after a real login, in rendered order.
 * The portal derives them from the roles in the session, so a mismatch means the seed or the JWT claims are off.
 */
export const NAV_LINKS: Record<Role, readonly string[]> = {
	[Role.ADMIN]: ["Dashboard", "Mentor Dashboard", "Mentors", "Members", "Mentees", "Mentorship", "Cycles", "Users"],
	[Role.MENTORSHIP_ADMIN]: ["Dashboard", "Mentors", "Members", "Mentees", "Mentorship", "Cycles"],
	[Role.LEADER]: ["Dashboard", "Mentors", "Members", "Users"],
	[Role.MENTOR]: ["Dashboard", "Mentor Dashboard", "My Profile"],
	[Role.MENTOR_AD_HOC]: ["Dashboard", "Mentor Dashboard", "My Profile"],
	[Role.MEMBER]: ["Dashboard"],
};
