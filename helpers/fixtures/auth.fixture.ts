import { test as base } from '@playwright/test';
import { Role } from '@auth/roles';

export type AuthOptions = {
  asRole: Role;
};

export const authTest = base.extend<AuthOptions>({
  asRole: ['admin', { option: true }],
});
