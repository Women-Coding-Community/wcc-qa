import { APIRequestContext, APIResponse } from "@playwright/test";
import { MentorshipAdminEndpoints } from "helpers/datafactory/constants/paths.data";

export class CycleClient {
	constructor(private readonly request: APIRequestContext) {}

	current(): Promise<APIResponse> {
		return this.request.get(MentorshipAdminEndpoints.CYCLE_CURRENT);
	}

	all(): Promise<APIResponse> {
		return this.request.get(MentorshipAdminEndpoints.CYCLES_ALL);
	}
}
