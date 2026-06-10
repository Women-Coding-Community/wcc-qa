import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures/common.fixtures';
import { loginResponseSchema } from 'helpers/datafactory/schemas/auth.schema';
import { usersResponseSchema } from 'helpers/datafactory/schemas/user.account.schema';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('AUTH-01: Login', () => {
  test('Login with valid credentials returns token', async ({ authApi }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing admin credentials — check tests/.env');
    }

    const response = await authApi.authentication.login(ADMIN_EMAIL, ADMIN_PASSWORD, true);

    // Schema parse verifies token, expiresAt, and roles are present and well-formed.
    loginResponseSchema.parse(await response.json());
  });
});

test.describe('AUTH-07: Users', () => {
  test('Get users with admin token returns user list', async ({ adminApi }) => {
    const response = await adminApi.authentication.getUsers(true);

    const users = usersResponseSchema.parse(await response.json());
    expect(users.length).toBeGreaterThan(0);
  });
});
