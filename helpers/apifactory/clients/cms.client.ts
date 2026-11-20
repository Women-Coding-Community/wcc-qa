import { APIRequestContext, APIResponse } from "@playwright/test";
import { CycleMentorshipType } from "helpers/datafactory/constants/cycle.data";
import { CmsEndpoints } from "helpers/datafactory/constants/paths.data";

export class CmsClient {
	constructor(private readonly request: APIRequestContext) {}

	mentors(mentorshipType?: CycleMentorshipType): Promise<APIResponse> {
		return this.request.get(CmsEndpoints.MENTORSHIP_MENTORS, {
			params: mentorshipType ? { mentorshipTypes: mentorshipType } : undefined,
		});
	}
}
