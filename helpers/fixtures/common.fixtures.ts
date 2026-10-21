import { test as base, APIRequestContext, PlaywrightWorkerArgs, TestFixture } from "@playwright/test";
import { APIService } from "helpers/apifactory/api.service";
import { MailHogClient } from "helpers/apifactory/clients/mailhog.client";
import { MailHogService } from "helpers/apifactory/services/mailhog.service";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { INVALID_TOKEN } from "helpers/datafactory/constants/auth.data";

/**
 * API fixtures: one {@link APIService} per authentication mode.
 *
 *   authApi          X-API-KEY only            public / registration endpoints
 *   noApiKeyApi      no headers at all         asserting the API-key filter
 *   invalidTokenApi  X-API-KEY + unknown token asserting rejected sessions
 *   <role>Api        X-API-KEY + role's token  adminApi, leaderApi, mentorApi, mentorshipAdminApi, memberApi, mentorAdHocApi
 *   apiForRole(role) same, for role-matrix tests
 *   mailhog          no headers, MAILHOG_HOST  email delivery assertions (not an APIService: different host)
 *
 * Each service exposes its context as `.request` for endpoints without a service method.
 * Tokens are fetched once per worker and role.
 */

type TestFixtures = {
	authApi: APIService;
	noApiKeyApi: APIService;
	invalidTokenApi: APIService;
	apiForRole: (role: Role) => Promise<APIService>;
	adminApi: APIService;
	leaderApi: APIService;
	mentorApi: APIService;
	mentorshipAdminApi: APIService;
	memberApi: APIService;
	mentorAdHocApi: APIService;
	mailhog: MailHogService;
};

type WorkerFixtures = {
	/** Logs a role in once per worker and caches the token. */
	tokenFor: (role: Role) => Promise<string>;
};

type Headers = Record<string, string>;

const BASE_URL = process.env.API_HOST ?? "http://localhost:8080";
const MAILHOG_BASE_URL = process.env.MAILHOG_HOST ?? "http://localhost:8025";

/** Read lazily: the merged UI fixtures import this module without needing API_KEY. */
function apiKeyHeaders(): Headers {
	const key = process.env.API_KEY;
	if (!key) {
		throw new Error("Missing API_KEY — check tests/.env");
	}
	return { "X-API-KEY": key };
}

const bearerHeaders = (token: string): Headers => ({ ...apiKeyHeaders(), Authorization: `Bearer ${token}` });

function newContext(playwright: PlaywrightWorkerArgs["playwright"], headers: Headers): Promise<APIRequestContext> {
	return playwright.request.newContext({ baseURL: BASE_URL, extraHTTPHeaders: headers });
}

/** A fixture serving an APIService whose context sends `headers`, disposed after the test. */
const apiFixture =
	(headers: () => Headers): TestFixture<APIService, PlaywrightWorkerArgs> =>
	async ({ playwright }, use) => {
		const context = await newContext(playwright, headers());
		await use(new APIService(context));
		await context.dispose();
	};

export const test = base.extend<TestFixtures, WorkerFixtures>({
	tokenFor: [
		async ({ playwright }, use) => {
			const tokens = new Map<Role, string>();

			await use(async role => {
				const cached = tokens.get(role);
				if (cached) {
					return cached;
				}

				const { email, password } = USERS[role];
				const context = await newContext(playwright, apiKeyHeaders());
				try {
					const response = await new APIService(context).authentication.login(email, password, true);
					const { token } = await response.json();
					tokens.set(role, token);
					return token;
				} catch (error) {
					const reason = error instanceof Error ? error.message : String(error);
					throw new Error(`Login failed for role "${role}": ${reason}`);
				} finally {
					await context.dispose();
				}
			});
		},
		{ scope: "worker" },
	],

	authApi: apiFixture(apiKeyHeaders),
	noApiKeyApi: apiFixture(() => ({})),
	invalidTokenApi: apiFixture(() => bearerHeaders(INVALID_TOKEN)),

	apiForRole: async ({ playwright, tokenFor }, use) => {
		const contexts: APIRequestContext[] = [];

		await use(async role => {
			const context = await newContext(playwright, bearerHeaders(await tokenFor(role)));
			contexts.push(context);
			return new APIService(context);
		});

		await Promise.all(contexts.map(context => context.dispose()));
	},

	adminApi: async ({ apiForRole }, use) => use(await apiForRole(Role.ADMIN)),
	leaderApi: async ({ apiForRole }, use) => use(await apiForRole(Role.LEADER)),
	mentorApi: async ({ apiForRole }, use) => use(await apiForRole(Role.MENTOR)),
	mentorshipAdminApi: async ({ apiForRole }, use) => use(await apiForRole(Role.MENTORSHIP_ADMIN)),
	memberApi: async ({ apiForRole }, use) => use(await apiForRole(Role.MEMBER)),
	mentorAdHocApi: async ({ apiForRole }, use) => use(await apiForRole(Role.MENTOR_AD_HOC)),

	mailhog: async ({ playwright }, use) => {
		const context = await playwright.request.newContext({ baseURL: MAILHOG_BASE_URL });
		await use(new MailHogService(new MailHogClient(context)));
		await context.dispose();
	},
});
