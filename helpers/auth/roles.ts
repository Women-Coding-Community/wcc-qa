export const ROLES = ['admin', 'mentor', 'mentee', 'mentorship_admin'] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = ['settings', 'users', 'mentorships', 'mentees'] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
  admin: { settings: true, users: true, mentorships: true, mentees: true },
  mentorship_admin: { settings: true, users: false, mentorships: true, mentees: true },
  mentor: { settings: false, users: false, mentorships: false, mentees: true },
  mentee: { settings: false, users: false, mentorships: false, mentees: false },
};

export const can = (role: Role, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role][permission];
