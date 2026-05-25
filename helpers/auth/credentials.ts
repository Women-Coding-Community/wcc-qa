import { Role } from './roles';

export type RoleCredentials = {
  email: string;
  password: string;
};

const envKey = (role: Role, suffix: 'EMAIL' | 'PASSWORD') =>
  `${role.toUpperCase()}_${suffix}`;

export function getCredentials(role: Role): RoleCredentials {
  const email = process.env[envKey(role, 'EMAIL')];
  const password = process.env[envKey(role, 'PASSWORD')];
  if (!email || !password) {
    throw new Error(
      `Missing credentials for role "${role}". Set ${envKey(role, 'EMAIL')} and ${envKey(role, 'PASSWORD')}.`,
    );
  }
  return { email, password };
}
