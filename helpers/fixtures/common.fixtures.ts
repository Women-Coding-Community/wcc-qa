import { test as base, request as playwrightRequest, APIRequestContext } from '@playwright/test';
import { APIService } from 'helpers/apifactory/api.service';
import { USERS, type Role } from 'helpers/datafactory/constants/roles.data';

export type { Role };

const BASE_URL = process.env.API_HOST ?? 'http://localhost:8080';

/** Read API_KEY only when an API fixture actually needs it (so UI tests can load without it). */
function getApiKey(): string {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error('Missing API_KEY — check tests/.env');
  }
  return key;
}

type WorkerFixtures = {
  /** Logs a role in once per worker, caches and reuses the resulting token. */
  tokenFor: (role: Role) => Promise<string>;
};

type TestFixtures = {
  /** X-API-KEY only — for public/registration endpoints that need no role. */
  authRequest: APIRequestContext;
  /** Returns an X-API-KEY + Bearer context for any role on demand. */
  contextForRole: (role: Role) => Promise<APIRequestContext>;
  /** Convenience shorthands for the common per-role contexts. */
  adminContext: APIRequestContext;
  leaderContext: APIRequestContext;
  mentorContext: APIRequestContext;
  mentorshipAdminContext: APIRequestContext;
  /** APIService (clients + services) over the X-API-KEY-only context. */
  authApi: APIService;
  /** Returns an APIService bound to any role's authenticated context. */
  apiForRole: (role: Role) => Promise<APIService>;
  /** Convenience shorthands for the common per-role API services. */
  adminApi: APIService;
  leaderApi: APIService;
  mentorApi: APIService;
  mentorshipAdminApi: APIService;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  tokenFor: [
    async ({}, use) => {
      const cache = new Map<Role, string>();

      await use(async (role: Role) => {
        const cached = cache.get(role);
        if (cached) return cached;

        const { email, password } = USERS[role];

        const ctx = await playwrightRequest.newContext({
          baseURL: BASE_URL,
          extraHTTPHeaders: { 'X-API-KEY': getApiKey() },
        });
        const api = new APIService(ctx);
        try {
          const response = await api.authentication.login(email, password, true);
          const { token } = await response.json();
          cache.set(role, token);
          return token;
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          throw new Error(`Login failed for role "${role}": ${reason}`);
        } finally {
          await ctx.dispose();
        }
      });
    },
    { scope: 'worker' },
  ],

  authRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'X-API-KEY': getApiKey() },
    });
    await use(context);
    await context.dispose();
  },

  contextForRole: async ({ playwright, tokenFor }, use) => {
    const created: APIRequestContext[] = [];

    await use(async (role: Role) => {
      const token = await tokenFor(role);
      const context = await playwright.request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-API-KEY': getApiKey(),
          Authorization: `Bearer ${token}`,
        },
      });
      created.push(context);
      return context;
    });

    for (const context of created) await context.dispose();
  },

  adminContext: async ({ contextForRole }, use) => use(await contextForRole('admin')),
  leaderContext: async ({ contextForRole }, use) => use(await contextForRole('leader')),
  mentorContext: async ({ contextForRole }, use) => use(await contextForRole('mentor')),
  mentorshipAdminContext: async ({ contextForRole }, use) =>
    use(await contextForRole('mentorshipAdmin')),

  authApi: async ({ authRequest }, use) => use(new APIService(authRequest)),

  apiForRole: async ({ contextForRole }, use) =>
    use(async (role: Role) => new APIService(await contextForRole(role))),

  adminApi: async ({ adminContext }, use) => use(new APIService(adminContext)),
  leaderApi: async ({ leaderContext }, use) => use(new APIService(leaderContext)),
  mentorApi: async ({ mentorContext }, use) => use(new APIService(mentorContext)),
  mentorshipAdminApi: async ({ mentorshipAdminContext }, use) =>
    use(new APIService(mentorshipAdminContext)),
});

export { expect } from '@playwright/test';

