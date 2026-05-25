import { mergeTests } from '@playwright/test';
import { authTest } from './auth.fixture';
import { apiTest } from './api.fixture';
import { adminPagesTest, websitePagesTest } from './pages.fixture';
import { dataTest } from './data.fixture';
import { storageStatePath } from '@auth/storage-state';

const baseTest = mergeTests(authTest, apiTest, dataTest);

export const adminTest = mergeTests(baseTest, adminPagesTest).extend({
  storageState: [
    async ({ asRole }, use) => {
      await use(storageStatePath('admin', asRole));
    },
    { option: true },
  ],
});

export const websiteTest = mergeTests(apiTest, dataTest, websitePagesTest);

export const apiOnlyTest = mergeTests(apiTest, dataTest);

export { expect } from '@playwright/test';
export { ROLES, PERMISSIONS, can } from '@auth/roles';
export type { Role, Permission } from '@auth/roles';
