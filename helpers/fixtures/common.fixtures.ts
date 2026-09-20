import { test as base, APIRequestContext, PlaywrightWorkerArgs, TestFixture } from "@playwright/test";
import { APIService } from "helpers/apifactory/api.service";
import { USERS, Role } from "helpers/datafactory/constants/roles.data";
import { INVALID_TOKEN } from "helpers/datafactory/constants/auth.data";

/**
 * API fixtures: one {@link APIService} per authentication mode.
 *
 *   authApi          X-API-KEY only            public / registration endpoints
 *   noApiKeyApi      no headers at all         asserting the API-key filter
 *   invalidTokenApi  X-API-KEY + unknown token asserting rejected sessions
 *   <role>Api        X-API-KEY + role's token  adminApi, leaderApi, mentorApi, mentorshipAdminApi
 *   apiForRole(role) same, for role-matrix tests
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
};

type WorkerFixtures = {
	/** Logs a role in once per worker and caches the token. */
	tokenFor: (role: Role) => Promise<string>;
};

type Headers = Record<string, string>;

const BASE_URL = process.env.API_HOST ?? "http://localhost:8080";

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
});
