import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures';
import { LoginPage } from 'tests/admin/pages/login.page';
import { USERS } from 'helpers/datafactory/constants/roles.data';

test.describe('ADMIN-LOGIN-01: Login', () => {
  test('Login with valid admin credentials lands on the dashboard', { tag: '@smoke' }, async ({
    page,
    loginPage,
  }) => {
    const { email, password } = USERS.admin;

    await loginPage.navigateToURL(LoginPage.path);
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(loginPage.signInButton).toBeHidden();
  });
});
