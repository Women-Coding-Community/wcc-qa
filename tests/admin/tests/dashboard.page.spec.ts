import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures';
import { USERS } from 'helpers/datafactory/constants/roles.data';

test.use({ storageState: USERS.mentor.storageState });

test.describe('Dashboard Page Test', () => {
  test('Dashboard loads after navigating to root', { tag: '@smoke' }, async ({ page, loginPage }) => {
    await loginPage.navigateToURL('/');

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
