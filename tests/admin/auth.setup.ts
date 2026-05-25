import { test as setup } from '@playwright/test';
import { ROLES } from '@auth/roles';
import { getCredentials } from '@auth/credentials';
import { storageStatePath } from '@auth/storage-state';

for (const role of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const { email, password } = getCredentials(role);

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await page.waitForURL((url) => !url.pathname.includes('/login'));

    await page.context().storageState({ path: storageStatePath('admin', role) });
  });
}
