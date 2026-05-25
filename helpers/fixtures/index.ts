import { mergeTests, type TestFixture } from '@playwright/test';
import { authTest, type AuthOptions } from './auth.fixture';
import { apiTest } from './api.fixture';
import { adminPagesTest, websitePagesTest } from './pages.fixture';
import { dataTest } from './data.fixture';
import { storageStatePath } from '@auth/storage-state';

const baseTest = mergeTests(authTest, apiTest, dataTest);

const adminStorageState: TestFixture<string, AuthOptions> = async (
  { asRole },
  use,
) => {
  await use(storageStatePath('admin', asRole));
};

// `mergeTests` + overriding a built-in option (`storageState`) loses type info
// in Playwright's typings — the inferred `Fixtures` shape synthesises a
// `[x: string]: TestFixture<never, ...>` index signature that any extra key
// conflicts with. Cast is scoped to the fixtures object; runtime is correct.
export const adminTest = mergeTests(baseTest, adminPagesTest).extend({
  storageState: adminStorageState,
} as Parameters<ReturnType<typeof mergeTests>['extend']>[0]);

export const websiteTest = mergeTests(apiTest, dataTest, websitePagesTest);

export const apiOnlyTest = mergeTests(apiTest, dataTest);

export { expect } from '@playwright/test';
export { ROLES, PERMISSIONS, can } from '@auth/roles';
export type { Role, Permission } from '@auth/roles';
