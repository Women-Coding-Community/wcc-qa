import { test as base } from '@playwright/test';
import { APIService } from '@api/api.service';

export type APIFixtures = {
  api: APIService;
};

export const apiTest = base.extend<APIFixtures>({
  api: async ({ request }, use) => {
    await use(new APIService(request));
  },
});
